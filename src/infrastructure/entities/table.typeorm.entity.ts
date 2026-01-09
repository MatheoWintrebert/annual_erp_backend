import { ITable } from '@domain/types';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class TableTypeormEntity extends BaseEntity implements ITable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({name:'last_name', nullable: true, type: 'varchar'})
  lastName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}