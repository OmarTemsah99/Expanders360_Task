import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Project, Vendor]),
    MatchesModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
