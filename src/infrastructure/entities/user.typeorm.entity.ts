import { IUser } from '@domain/types';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserTypeormEntity extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'email', unique: true })
  email!: string;

  @Column({ name: 'password' })
  password!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret?: string | null;

  @Column({ name: 'is_two_factor_enabled', default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ name: 'backup_codes', type: 'json', nullable: true })
  backupCodes?: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}