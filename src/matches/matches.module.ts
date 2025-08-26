import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './entities/match.entity';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Project, Vendor]),
    NotificationsModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
