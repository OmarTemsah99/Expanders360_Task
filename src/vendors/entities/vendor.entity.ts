import { decimalTransformer } from 'src/common/transformers/decimal.transformer';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

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
}
