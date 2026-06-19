import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column({ nullable: true })
  group: string;

  @Column({ nullable: true })
  label: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
