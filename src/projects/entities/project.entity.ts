import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Client } from 'src/clients/client.entity';
import { decimalTransformer } from 'src/common/transformers/decimal.transformer';
import { Match } from 'src/matches/entities/match.entity';

@Entity('projects')
@Index('IDX_projects_status', ['status'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  country: string;

  @Column('simple-json')
  services_needed: string[]; // ["market_research", "legal_setup", ...]

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  budget: number; // stored as DECIMAL(12,2)

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'paused';

  @OneToMany(() => Match, (match) => match.project, { cascade: true })
  matches: Match[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
