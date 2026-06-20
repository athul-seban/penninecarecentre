import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('page_visits')
export class PageVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  path: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ip: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
