import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  authorAvatar: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  source: string;

  @Column({ default: true })
  isVisible: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
