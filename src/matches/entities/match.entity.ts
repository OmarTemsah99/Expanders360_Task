import { decimalTransformer } from 'src/common/transformers/decimal.transformer';
import { Project } from 'src/projects/entities/project.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('matches')
// Ensure (project_id, vendor_id) is unique → idempotent upsert later
@Index('UQ_matches_project_vendor', ['project', 'vendor'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { eager: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Vendor, { eager: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  score: number; // e.g., 0.00 – 99.99

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
