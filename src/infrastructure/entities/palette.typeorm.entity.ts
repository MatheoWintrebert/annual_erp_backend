import { IPalette } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PalettierTypeormEntity } from "./palettier.typeorm.entity";
import { PaletteLotTypeormEntity } from "./palette-lot.typeorm.entity";

@Entity("palette")
@Index(["palettierId", "positionX", "positionY", "positionZ"], { unique: true })
export class PaletteTypeormEntity extends BaseEntity implements IPalette {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "palettier_id", type: "int" })
  palettierId!: number;

  @Column({ name: "position_x", type: "int" })
  positionX!: number;

  @Column({ name: "position_y", type: "int" })
  positionY!: number;

  @Column({ name: "position_z", type: "int" })
  positionZ!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @ManyToOne(() => PalettierTypeormEntity, (palettier) => palettier.palettes)
  @JoinColumn({ name: "palettier_id" })
  palettier!: PalettierTypeormEntity;

  @OneToMany(() => PaletteLotTypeormEntity, (pl) => pl.palette)
  paletteLots!: PaletteLotTypeormEntity[];
}
