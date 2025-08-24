import { Exclude } from 'class-transformer';
import { Project } from 'src/projects/entities/project.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company_name: string;

  @Column({ unique: true })
  contact_email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 'client' })
  role: 'client' | 'admin';

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[];
}
