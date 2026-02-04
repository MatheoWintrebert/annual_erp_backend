import { IPalettier } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PalettierTypeTypeormEntity } from "./palettier-type.typeorm.entity";
import { PaletteTypeormEntity } from "./palette.typeorm.entity";

@Entity("palettier")
export class PalettierTypeormEntity extends BaseEntity implements IPalettier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "palettier_type_id", type: "int", nullable: true })
  palettierTypeId!: number | null;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "int" })
  width!: number;

  @Column({ type: "int" })
  depth!: number;

  @Column({ type: "int" })
  height!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @ManyToOne(() => PalettierTypeTypeormEntity, (type) => type.palettiers)
  @JoinColumn({ name: "palettier_type_id" })
  palettierType!: PalettierTypeTypeormEntity | null;

  @OneToMany(() => PaletteTypeormEntity, (palette) => palette.palettier)
  palettes!: PaletteTypeormEntity[];
}
