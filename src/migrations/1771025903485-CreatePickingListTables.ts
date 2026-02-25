import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePickingListTables1771025903485 implements MigrationInterface {
  name = "CreatePickingListTables1771025903485";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`picking_list_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`picking_list_id\` int NOT NULL, \`product_id\` int NOT NULL, \`requested_quantity\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`picking_lists\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` varchar(20) NOT NULL DEFAULT 'created', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` ADD CONSTRAINT \`FK_2e71651d2fdd7efb8994d5cc6fc\` FOREIGN KEY (\`picking_list_id\`) REFERENCES \`picking_lists\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` ADD CONSTRAINT \`FK_f20605e07444404effcb167a89b\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` DROP FOREIGN KEY \`FK_f20605e07444404effcb167a89b\``
    );
    await queryRunner.query(
      `ALTER TABLE \`picking_list_items\` DROP FOREIGN KEY \`FK_2e71651d2fdd7efb8994d5cc6fc\``
    );
    await queryRunner.query(`DROP TABLE \`picking_lists\``);
    await queryRunner.query(`DROP TABLE \`picking_list_items\``);
  }
}
