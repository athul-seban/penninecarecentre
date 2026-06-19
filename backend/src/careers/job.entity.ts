import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  department: string;

  @Column({ default: 'Full-time' })
  type: string;

  @Column({ nullable: true })
  location: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  requirements: string;

  @Column({ default: true })
  isOpen: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
