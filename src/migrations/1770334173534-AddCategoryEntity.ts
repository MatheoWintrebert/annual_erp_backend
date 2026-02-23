import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryEntity1770334173534 implements MigrationInterface {
  name = "AddCategoryEntity1770334173534";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` CHANGE \`category\` \`category_id\` varchar(100) NOT NULL`
    );
    await queryRunner.query(
      `CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_23c05c292c439d77b0de816b50\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`category_id\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` DROP COLUMN \`category_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` ADD \`category_id\` int NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` ADD CONSTRAINT \`FK_79e9b982b61b46b74a4d1f5f425\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD CONSTRAINT \`FK_0dce9bc93c2d2c399982d04bef1\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_0dce9bc93c2d2c399982d04bef1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` DROP FOREIGN KEY \`FK_79e9b982b61b46b74a4d1f5f425\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` DROP COLUMN \`category_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` ADD \`category_id\` varchar(100) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`category_id\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_23c05c292c439d77b0de816b50\` ON \`category\``
    );
    await queryRunner.query(`DROP TABLE \`category\``);
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` CHANGE \`category_id\` \`category\` varchar(100) NOT NULL`
    );
  }
}
