import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'archived';

@Entity('career_applications')
export class CareerApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  position: string;

  @Column('text')
  coverLetter: string;

  @Column({ nullable: true })
  cvUrl: string;

  @Column({ nullable: true })
  cvPublicId: string;

  @Column({ nullable: true })
  cvOriginalName: string;

  @Column({ default: 'new' })
  status: ApplicationStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
