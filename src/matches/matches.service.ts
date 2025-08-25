import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import {
  MatchCriteria,
  MatchResult,
  RebuildMatchesResult,
} from './interfaces/match.interface';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  // Default matching criteria - can be made configurable
  private readonly defaultCriteria: MatchCriteria = {
    minimumScore: 5.0,
    serviceWeight: 2.0,
    ratingWeight: 1.0,
    fastSlaBonus: 3.0, // < 24 hours
    mediumSlaBonus: 1.0, // 24-72 hours
  };

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  /**
   * Main method to rebuild matches for a specific project
   */
  async rebuildMatches(
    projectId: string,
    criteria: MatchCriteria = this.defaultCriteria,
  ): Promise<RebuildMatchesResult> {
    this.logger.log(`Rebuilding matches for project ${projectId}`);

    // 1. Fetch project with client relation
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== 'active') {
      throw new BadRequestException(
        `Cannot rebuild matches for ${project.status} project`,
      );
    }

    // 2. Get all available vendors
    const allVendors = await this.vendorRepo.find();
    this.logger.log(`Found ${allVendors.length} total vendors`);

    // 3. Calculate matches
    const eligibleMatches = this.calculateMatches(
      project,
      allVendors,
      criteria,
    );
    this.logger.log(`${eligibleMatches.length} eligible matches calculated`);

    // 4. Get existing matches to track what's new vs updated
    const existingMatches = await this.matchRepo.find({
      where: { project: { id: projectId } },
      relations: ['vendor'],
    });

    const existingVendorIds = new Set(
      existingMatches.map((match) => match.vendor.id),
    );

    // 5. Prepare entities for upsert
    const matchEntities = await Promise.all(
      eligibleMatches.map(async (result) => {
        const vendor = await this.vendorRepo.findOneBy({
          id: result.vendor.id,
        });
        if (!vendor) {
          throw new NotFoundException(`Vendor ${result.vendor.id} not found`);
        }

        return this.matchRepo.create({
          project,
          vendor,
          score: result.score,
          matchDetails: result.matchDetails,
        });
      }),
    );

    // 6. Replace existing matches for this project with the newly calculated set.
    // Simpler and more reliable than upsert when entities include relations.
    let matchesCreated = 0;
    let matchesUpdated = 0;

    try {
      // Remove all existing matches for the project first
      await this.matchRepo.delete({ project: { id: projectId } });

      if (matchEntities.length > 0) {
        await this.matchRepo.save(matchEntities);
      }

      // Count new vs updated based on previous state
      matchesCreated = eligibleMatches.filter(
        (match) => !existingVendorIds.has(match.vendor.id),
      ).length;
      matchesUpdated = eligibleMatches.length - matchesCreated;
    } catch (error) {
      this.logger.error('Failed to replace matches', error);
      throw error;
    }

    this.logger.log(
      `Matches rebuilt: ${matchesCreated} created, ${matchesUpdated} updated`,
    );

    return {
      projectId,
      totalVendorsConsidered: allVendors.length,
      eligibleVendors: eligibleMatches.length,
      matchesCreated,
      matchesUpdated,
      matches: eligibleMatches,
    };
  }

  /**
   * Calculate match scores based on business rules
   */
  private calculateMatches(
    project: Project,
    vendors: Vendor[],
    criteria: MatchCriteria,
  ): MatchResult[] {
    const matches: MatchResult[] = [];

    for (const vendor of vendors) {
      // Rule 1: Country Support Check
      const countryMatch = vendor.countries_supported.includes(project.country);
      if (!countryMatch) {
        this.logger.debug(
          `Vendor ${vendor.name} doesn't support ${project.country}`,
        );
        continue;
      }

      // Rule 2: Service Overlap Check
      const servicesOverlap = project.services_needed.filter((service) =>
        vendor.services_offered.includes(service),
      );

      if (servicesOverlap.length === 0) {
        this.logger.debug(
          `Vendor ${vendor.name} has no service overlap with project requirements`,
        );
        continue;
      }

      // Rule 3: Calculate Score
      const scoreBreakdown = this.calculateScore(
        servicesOverlap,
        vendor,
        criteria,
      );

      // Rule 4: Minimum Score Threshold
      if (scoreBreakdown.totalScore < criteria.minimumScore) {
        this.logger.debug(
          `Vendor ${vendor.name} score ${scoreBreakdown.totalScore} below minimum ${criteria.minimumScore}`,
        );
        continue;
      }

      // Create match result
      matches.push({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          rating: vendor.rating,
          response_sla_hours: vendor.response_sla_hours,
          countries_supported: vendor.countries_supported,
          services_offered: vendor.services_offered,
        },
        score: scoreBreakdown.totalScore,
        matchDetails: {
          servicesOverlap,
          countryMatch,
          ratingBonus: scoreBreakdown.ratingBonus,
          slaBonus: scoreBreakdown.slaBonus,
          reasonForScore: scoreBreakdown.explanation,
        },
      });
    }

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate detailed scoring breakdown
   */
  private calculateScore(
    servicesOverlap: string[],
    vendor: Vendor,
    criteria: MatchCriteria,
  ) {
    const serviceScore = servicesOverlap.length * criteria.serviceWeight;
    const ratingBonus = (vendor.rating || 0) * criteria.ratingWeight;

    let slaBonus = 0;
    if (vendor.response_sla_hours <= 24) {
      slaBonus = criteria.fastSlaBonus;
    } else if (vendor.response_sla_hours <= 72) {
      slaBonus = criteria.mediumSlaBonus;
    }

    const totalScore = serviceScore + ratingBonus + slaBonus;

    const explanation = [
      `Services: ${servicesOverlap.length} × ${criteria.serviceWeight} = ${serviceScore}`,
      `Rating: ${vendor.rating} × ${criteria.ratingWeight} = ${ratingBonus}`,
      `SLA (${vendor.response_sla_hours}h): ${slaBonus}`,
      `Total: ${totalScore.toFixed(2)}`,
    ].join(', ');

    return {
      totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimals
      serviceScore,
      ratingBonus,
      slaBonus,
      explanation,
    };
  }

  /**
   * Get all matches for a project with pagination
   */
  async getProjectMatches(
    projectId: string,
    userId: number,
    role: 'client' | 'admin',
    page: number = 1,
    limit: number = 10,
  ) {
    // Verify project access (same logic as ProjectsService)
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (role !== 'admin' && project.client.id !== userId) {
      throw new BadRequestException('You do not own this project');
    }

    // Get matches with pagination
    const [matches, total] = await this.matchRepo.findAndCount({
      where: { project: { id: projectId } },
      relations: ['vendor'],
      order: { score: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      matches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific match by ID
   */
  async getMatchById(
    matchId: number,
    userId: number,
    role: 'client' | 'admin',
  ): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['project', 'project.client', 'vendor'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Verify access
    if (role !== 'admin' && match.project.client.id !== userId) {
      throw new BadRequestException('You do not have access to this match');
    }

    return match;
  }

  /**
   * Delete specific match (admin only)
   */
  async deleteMatch(
    matchId: number,
    userId: number,
    role: 'client' | 'admin',
  ): Promise<{ deleted: true }> {
    if (role !== 'admin') {
      throw new BadRequestException('Only admins can delete matches');
    }

    const match = await this.getMatchById(matchId, userId, role);
    await this.matchRepo.remove(match);

    this.logger.log(`Match ${matchId} deleted by admin user ${userId}`);
    return { deleted: true };
  }

  /**
   * Get all matches across all projects (admin only)
   */
  async getAllMatches(page: number = 1, limit: number = 20) {
    const [matches, total] = await this.matchRepo.findAndCount({
      relations: ['project', 'project.client', 'vendor'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: Math.min(limit, 100), // Cap at 100
    });

    return {
      matches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
