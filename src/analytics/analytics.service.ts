import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Match } from '../matches/entities/match.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Project } from '../projects/entities/project.entity';
import {
  Document,
  DocumentDocument,
} from '../documents/schemas/document.schema';
import {
  TopVendorByCountry,
  VendorAnalytics,
  AnalyticsTopVendorsResponse,
  VendorPerformanceMetrics,
  ProjectActivityByCountry,
  MySQLVendorQueryResult,
  ProjectQueryResult,
} from './interfaces/analytics.interface';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectModel(Document.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {}

  /**
   * Get top 3 vendors per country based on average match scores in the last 30 days
   * Combined with document counts from MongoDB
   */
  async getTopVendorsByCountry(
    periodDays: number = 30,
  ): Promise<AnalyticsTopVendorsResponse> {
    this.logger.log(
      `Generating top vendors analytics for last ${periodDays} days`,
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    // Step 1: Get top vendors by country from MySQL (relational data)
    const topVendorsByCountry = await this.getTopVendorsFromMySQL(cutoffDate);

    // Step 2: Get document counts by country from MongoDB (non-relational data)
    const documentCountsByCountry = await this.getDocumentCountsFromMongoDB();

    // Step 3: Combine the results
    const combinedResults: TopVendorByCountry[] = [];

    // Process each country that has vendor matches
    for (const countryData of topVendorsByCountry) {
      const documentCount =
        documentCountsByCountry.get(countryData.country) || 0;

      combinedResults.push({
        country: countryData.country,
        vendors: countryData.vendors,
        documentCount,
      });
    }

    // Add countries that have documents but no recent matches
    for (const [country, documentCount] of documentCountsByCountry) {
      if (!combinedResults.find((result) => result.country === country)) {
        combinedResults.push({
          country,
          vendors: [],
          documentCount,
        });
      }
    }

    // Sort countries by total vendor performance and document activity
    combinedResults.sort((a, b) => {
      const scoreA = (a.vendors[0]?.avgMatchScore || 0) + a.documentCount * 0.1;
      const scoreB = (b.vendors[0]?.avgMatchScore || 0) + b.documentCount * 0.1;
      return scoreB - scoreA;
    });

    this.logger.log(
      `Analytics generated for ${combinedResults.length} countries`,
    );

    return {
      countries: combinedResults,
      generatedAt: new Date(),
      periodDays,
    };
  }

  /**
   * Get top 3 vendors per country from MySQL based on match scores
   */
  private async getTopVendorsFromMySQL(cutoffDate: Date): Promise<
    {
      country: string;
      vendors: VendorAnalytics[];
    }[]
  > {
    // Raw SQL query to get top vendors by country with their average match scores
    const rawQuery = `
      SELECT 
        p.country,
        v.id as vendor_id,
        v.name as vendor_name,
        v.rating,
        v.response_sla_hours,
        AVG(m.score) as avg_match_score,
        COUNT(m.id) as match_count,
        ROW_NUMBER() OVER (PARTITION BY p.country ORDER BY AVG(m.score) DESC, COUNT(m.id) DESC) as rank_num
      FROM matches m
      INNER JOIN projects p ON m.project_id = p.id
      INNER JOIN vendors v ON m.vendor_id = v.id
      WHERE m.created_at >= ?
      GROUP BY p.country, v.id, v.name, v.rating, v.response_sla_hours
      HAVING COUNT(m.id) > 0
      ORDER BY p.country, avg_match_score DESC
    `;

    const results: MySQLVendorQueryResult[] = await this.matchRepo.query(
      rawQuery,
      [cutoffDate],
    );

    // Group by country and take top 3 per country
    const countryMap = new Map<string, any[]>();

    results.forEach((row: MySQLVendorQueryResult) => {
      const country = row.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, []);
      }

      const countryVendors = countryMap.get(country)!;
      if (countryVendors.length < 3 && row.rank_num <= 3) {
        countryVendors.push({
          id: row.vendor_id,
          name: row.vendor_name,
          avgMatchScore:
            Math.round(parseFloat(row.avg_match_score) * 100) / 100,
          matchCount: parseInt(row.match_count),
          rating: parseFloat(row.rating),
          responseSlaHours: parseInt(row.response_sla_hours),
        });
      }
    });

    // Convert to array format
    return Array.from(countryMap.entries()).map(([country, vendors]) => ({
      country,
      vendors,
    }));
  }

  /**
   * Get document counts per country from MongoDB
   */
  private async getDocumentCountsFromMongoDB(): Promise<Map<string, number>> {
    // First, get all project IDs and their countries from MySQL
    const projects = await this.projectRepo.find({
      select: ['id', 'country'],
    });

    const projectCountryMap = new Map<string, string>();
    projects.forEach((project) => {
      projectCountryMap.set(project.id, project.country);
    });

    // Get all documents from MongoDB
    const documents = await this.documentModel
      .find({}, 'projectId')
      .lean()
      .exec();

    // Count documents by country
    const countryDocumentCounts = new Map<string, number>();

    documents.forEach((doc) => {
      const country = projectCountryMap.get(doc.projectId);
      if (country) {
        const currentCount = countryDocumentCounts.get(country) || 0;
        countryDocumentCounts.set(country, currentCount + 1);
      }
    });

    this.logger.log(
      `Document counts calculated for ${countryDocumentCounts.size} countries`,
    );

    return countryDocumentCounts;
  }

  /**
   * Additional analytics methods can be added here
   */

  /**
   * Get vendor performance summary across all countries
   */
  async getVendorPerformanceSummary(
    periodDays: number = 30,
  ): Promise<VendorPerformanceMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const query = `
      SELECT 
        v.id,
        v.name,
        v.rating,
        v.response_sla_hours,
        COUNT(DISTINCT p.country) as countries_active,
        COUNT(m.id) as total_matches,
        AVG(m.score) as avg_score,
        MAX(m.score) as best_score,
        MIN(m.score) as worst_score
      FROM vendors v
      LEFT JOIN matches m ON v.id = m.vendor_id AND m.created_at >= ?
      LEFT JOIN projects p ON m.project_id = p.id
      GROUP BY v.id, v.name, v.rating, v.response_sla_hours
      ORDER BY avg_score DESC, total_matches DESC
    `;

    return await this.matchRepo.query(query, [cutoffDate]);
  }

  /**
   * Get project activity by country with document correlation
   */
  async getProjectActivityByCountry(
    periodDays: number = 30,
  ): Promise<ProjectActivityByCountry[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    // Get project data from MySQL
    const projectData: ProjectQueryResult[] = await this.projectRepo
      .createQueryBuilder('project')
      .select([
        'project.country',
        'COUNT(project.id) as project_count',
        'AVG(project.budget) as avg_budget',
        'SUM(project.budget) as total_budget',
      ])
      .where('project.createdAt >= :cutoffDate', { cutoffDate })
      .groupBy('project.country')
      .getRawMany();

    // Get document counts by country
    const documentCounts = await this.getDocumentCountsFromMongoDB();

    // Combine the data
    return projectData.map((data) => ({
      country: data.project_country,
      projectCount: parseInt(data.project_count),
      avgBudget: parseFloat(data.avg_budget) || 0,
      totalBudget: parseFloat(data.total_budget) || 0,
      documentCount: documentCounts.get(data.project_country) || 0,
      docsPerProject: documentCounts.get(data.project_country)
        ? documentCounts.get(data.project_country)! /
          parseInt(data.project_count)
        : 0,
    }));
  }
}
