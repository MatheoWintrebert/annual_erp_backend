import { ICompanySettings } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("company_settings")
export class CompanySettingsTypeormEntity
  extends BaseEntity
  implements ICompanySettings
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 10, default: "fr" })
  language!: string;

  @Column({ type: "varchar", length: 50, default: "Europe/Paris" })
  timezone!: string;

  @Column({
    name: "branding_logo_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  brandingLogoUrl!: string | null;

  @Column({
    name: "primary_color",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  primaryColor!: string | null;

  @Column({
    name: "secondary_color",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  secondaryColor!: string | null;

  @Column({
    name: "contact_email",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  contactEmail!: string | null;

  @Column({
    name: "contact_phone",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  contactPhone!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
