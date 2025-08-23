import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company_name: string;

  @Column({ unique: true })
  contact_email: string;

  @Column()
  password: string; // hashed

  @Column({ default: 'client' })
  role: 'client' | 'admin';
}
