import { IPickingList, PickingListStatus } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PickingListItemTypeormEntity } from "./picking-list-item.typeorm.entity";

@Entity("picking_lists")
export class PickingListTypeormEntity
  extends BaseEntity
  implements IPickingList
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20, default: PickingListStatus.CREATED })
  status!: PickingListStatus;

  @OneToMany(() => PickingListItemTypeormEntity, (item) => item.pickingList, {
    cascade: true,
  })
  items!: PickingListItemTypeormEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
