import { IPickingListItem, PickingListItemStatus } from "@domain/types";
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
import { PickingListTypeormEntity } from "./picking-list.typeorm.entity";
import { ProductTypeormEntity } from "./product.typeorm.entity";

@Entity("picking_list_items")
export class PickingListItemTypeormEntity
  extends BaseEntity
  implements IPickingListItem
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "picking_list_id" })
  pickingListId!: number;

  @ManyToOne(() => PickingListTypeormEntity, (list) => list.items)
  @JoinColumn({ name: "picking_list_id" })
  pickingList!: PickingListTypeormEntity;

  @Column({ name: "product_id" })
  productId!: number;

  @ManyToOne(() => ProductTypeormEntity)
  @JoinColumn({ name: "product_id" })
  product!: ProductTypeormEntity;

  @Column({ name: "requested_quantity", type: "int" })
  requestedQuantity!: number;

  @Column({ name: "picked_quantity", type: "int", nullable: true, default: null })
  pickedQuantity!: number | null;

  @Column({
    name: "status",
    type: "varchar",
    length: 20,
    default: PickingListItemStatus.PENDING,
  })
  status!: PickingListItemStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
