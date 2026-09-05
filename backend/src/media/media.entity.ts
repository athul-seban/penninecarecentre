import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column()
  resourceType: string;

  @Column({ nullable: true })
  folder: string;

  @Column({ nullable: true })
  altText: string;

  @Column({ type: 'bytea', nullable: true, select: false })
  data: Buffer | null;

  @Column({ nullable: true })
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;
}
