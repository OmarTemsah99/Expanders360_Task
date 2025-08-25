import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Match } from '../../matches/entities/match.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('vendors')
@Index('IDX_vendors_rating', ['rating'])
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('simple-json')
  countries_supported: string[]; // e.g., ["US", "AE"]

  @Column('simple-json')
  services_offered: string[]; // e.g., ["market_research", "hiring"]

  @Column('decimal', {
    precision: 2,
    scale: 1,
    transformer: decimalTransformer,
  })
  rating: number; // 0.0 – 5.0

  @Column('int')
  response_sla_hours: number;

  @OneToMany(() => Match, (match) => match.vendor, { cascade: true })
  matches: Match[];
}
