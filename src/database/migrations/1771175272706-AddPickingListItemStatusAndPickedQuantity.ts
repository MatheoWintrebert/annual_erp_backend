import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPickingListItemStatusAndPickedQuantity1771175272706 implements MigrationInterface {
  name = "AddPickingListItemStatusAndPickedQuantity1771175272706";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` ADD \`picked_quantity\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` ADD \`status\` varchar(20) NOT NULL DEFAULT 'pending'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` DROP COLUMN \`status\``
    );
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` DROP COLUMN \`picked_quantity\``
    );
  }
}
