import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

@Entity('matches')
@Unique('UQ_match_project_vendor', ['project', 'vendor'])
@Index('IDX_matches_score', ['score'])
@Index('IDX_matches_created_at', ['createdAt'])
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.matches, {
    eager: true,
    onDelete: 'CASCADE', // If project deleted, remove matches
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Vendor, (vendor) => vendor.matches, {
    eager: true,
    onDelete: 'CASCADE', // If vendor deleted, remove matches
  })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
    comment: 'Matching score (0.00 - 100.00)',
  })
  score: number;

  @Column('simple-json', { nullable: true })
  matchDetails?: {
    servicesOverlap: string[];
    countryMatch: boolean;
    ratingBonus: number;
    slaBonus: number;
    reasonForScore: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
