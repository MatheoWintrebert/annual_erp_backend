import { IPaletteLot } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PaletteTypeormEntity } from "./palette.typeorm.entity";
import { LotTypeormEntity } from "./lot.typeorm.entity";

@Entity("palette_lot")
export class PaletteLotTypeormEntity extends BaseEntity implements IPaletteLot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "palette_id", type: "int" })
  paletteId!: number;

  @Column({ name: "lot_id", type: "int" })
  lotId!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => PaletteTypeormEntity, (palette) => palette.paletteLots)
  @JoinColumn({ name: "palette_id" })
  palette!: PaletteTypeormEntity;

  @ManyToOne(() => LotTypeormEntity, (lot) => lot.paletteLots)
  @JoinColumn({ name: "lot_id" })
  lot!: LotTypeormEntity;
}
