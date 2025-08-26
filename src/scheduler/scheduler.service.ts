import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Vendor) private readonly vendors: Repository<Vendor>,
    private readonly matches: MatchesService,
  ) {}

  // Refresh matches daily for active projects
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async refreshActiveProjects() {
    const active = await this.projects.find({ where: { status: 'active' } });
    for (const p of active) {
      try {
        await this.matches.rebuildMatches(p.id);
        this.logger.log(`Refreshed matches for project ${p.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to refresh matches for project ${p.id}`,
          error,
        );
      }
    }
  }

  // Flag vendors with expired SLAs
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async flagExpiredSlas() {
    const now = new Date();

    try {
      // Set expired flag to true for vendors with expired SLAs
      const expiredResult = await this.vendors
        .createQueryBuilder()
        .update(Vendor)
        .set({ sla_expired: true })
        .where('sla_expires_at IS NOT NULL')
        .andWhere('sla_expires_at < :now', { now })
        .execute();

      // Set expired flag to false for vendors with valid/no SLAs
      const validResult = await this.vendors
        .createQueryBuilder()
        .update(Vendor)
        .set({ sla_expired: false })
        .where('sla_expires_at IS NULL OR sla_expires_at >= :now', { now })
        .execute();

      this.logger.log(
        `SLA flags updated: ${expiredResult.affected} expired, ${validResult.affected} valid/no-SLA`,
      );
    } catch (error) {
      this.logger.error('Failed to update SLA flags', error);
    }
  }
}
