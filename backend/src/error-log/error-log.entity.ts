import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column({ type: 'int' })
  statusCode: number;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  stack: string;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn()
  createdAt: Date;
}
