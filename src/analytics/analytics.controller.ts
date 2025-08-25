import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/top-vendors
   *
   * Returns top 3 vendors per country based on average match scores from MySQL,
   * combined with research document counts from MongoDB.
   *
   * Query params:
   * - days: number of days to look back (default: 30)
   *
   * Example: GET /analytics/top-vendors?days=60
   */
  @Get('top-vendors')
  @Roles('admin', 'client') // Both admins and clients can view analytics
  async getTopVendorsByCountry(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    // Limit the range to prevent excessive queries
    const safeDays = Math.min(Math.max(days, 1), 365);

    return this.analyticsService.getTopVendorsByCountry(safeDays);
  }

  /**
   * GET /analytics/vendor-performance
   *
   * Returns overall vendor performance metrics across all countries
   *
   * Query params:
   * - days: number of days to look back (default: 30)
   */
  @Get('vendor-performance')
  @Roles('admin') // Admin-only endpoint for detailed vendor analytics
  async getVendorPerformance(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const safeDays = Math.min(Math.max(days, 1), 365);

    return {
      data: await this.analyticsService.getVendorPerformanceSummary(safeDays),
      periodDays: safeDays,
      generatedAt: new Date(),
    };
  }

  /**
   * GET /analytics/project-activity
   *
   * Returns project activity by country with document correlation
   *
   * Query params:
   * - days: number of days to look back (default: 30)
   */
  @Get('project-activity')
  @Roles('admin', 'client')
  async getProjectActivity(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const safeDays = Math.min(Math.max(days, 1), 365);

    return {
      data: await this.analyticsService.getProjectActivityByCountry(safeDays),
      periodDays: safeDays,
      generatedAt: new Date(),
    };
  }
}
