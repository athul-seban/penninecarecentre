import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('page_content')
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  pageKey: string;

  @Column({ nullable: true })
  title: string;

  @Column('jsonb', { nullable: true })
  sections: Record<string, any>;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
