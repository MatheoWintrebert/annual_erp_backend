import { ILot } from "@domain/types";
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
import { ProductTypeormEntity } from "./product.typeorm.entity";
import { PaletteLotTypeormEntity } from "./palette-lot.typeorm.entity";

@Entity("lot")
@Index(["productId", "reference"])
export class LotTypeormEntity extends BaseEntity implements ILot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "product_id", type: "int" })
  productId!: number;

  @Column({ type: "varchar", length: 100 })
  reference!: string;

  @Column({ name: "supplier_name", type: "varchar", length: 255 })
  supplierName!: string;

  @Column({ name: "total_quantity", type: "decimal", precision: 10, scale: 2 })
  totalQuantity!: number;

  @Column({ name: "arrival_date", type: "date" })
  arrivalDate!: Date;

  @Column({ name: "expiration_date", type: "date", nullable: true })
  expirationDate!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @ManyToOne(() => ProductTypeormEntity, (product) => product.lots)
  @JoinColumn({ name: "product_id" })
  product!: ProductTypeormEntity;

  @OneToMany(() => PaletteLotTypeormEntity, (pl) => pl.lot)
  paletteLots!: PaletteLotTypeormEntity[];
}
