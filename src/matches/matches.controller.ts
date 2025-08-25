import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RebuildMatchesResult } from './interfaces/match.interface';

interface AuthUser {
  userId: number;
  role: 'client' | 'admin';
  email: string;
}

@Controller('matches')
@UseGuards(RolesGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * Rebuild matches for a specific project
   * POST /matches/projects/:projectId/rebuild
   */
  @Post('projects/:projectId/rebuild')
  @Roles('client', 'admin')
  async rebuildProjectMatches(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<RebuildMatchesResult> {
    return this.matchesService.rebuildMatches(projectId);
  }

  /**
   * Get matches for a project with pagination
   * GET /matches/projects/:projectId?page=1&limit=10
   */
  @Get('projects/:projectId')
  @Roles('client', 'admin')
  async getProjectMatches(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.matchesService.getProjectMatches(
      projectId,
      user.userId,
      user.role,
      page,
      Math.min(limit, 50), // Cap at 50 per page
    );
  }

  /**
   * Get specific match details
   * GET /matches/:matchId
   */
  @Get(':matchId')
  @Roles('client', 'admin')
  async getMatch(
    @Param('matchId', ParseIntPipe) matchId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.matchesService.getMatchById(matchId, user.userId, user.role);
  }

  /**
   * Delete a match (admin only)
   * DELETE /matches/:matchId
   */
  @Delete(':matchId')
  @Roles('admin')
  async deleteMatch(
    @Param('matchId', ParseIntPipe) matchId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.matchesService.deleteMatch(matchId, user.userId, user.role);
  }

  /**
   * Get all matches across all projects (admin only)
   * GET /matches?page=1&limit=20
   */
  @Get()
  @Roles('admin')
  async getAllMatches(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.matchesService.getAllMatches(page, limit);
  }
}
