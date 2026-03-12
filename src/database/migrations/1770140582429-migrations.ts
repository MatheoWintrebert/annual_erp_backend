import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1770140582429 implements MigrationInterface {
  name = "Migrations1770140582429";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`palettier_type\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`palettier\` (\`id\` int NOT NULL AUTO_INCREMENT, \`palettier_type_id\` int NULL, \`name\` varchar(100) NOT NULL, \`width\` int NOT NULL, \`depth\` int NOT NULL, \`height\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`palette\` (\`id\` int NOT NULL AUTO_INCREMENT, \`palettier_id\` int NOT NULL, \`position_x\` int NOT NULL, \`position_y\` int NOT NULL, \`position_z\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_ffd4557ace33f58a6f5f135f7e\` (\`palettier_id\`, \`position_x\`, \`position_y\`, \`position_z\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`palette_lot\` (\`id\` int NOT NULL AUTO_INCREMENT, \`palette_id\` int NOT NULL, \`lot_id\` int NOT NULL, \`quantity\` decimal(10,2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`lot\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`reference\` varchar(100) NOT NULL, \`supplier_name\` varchar(255) NOT NULL, \`total_quantity\` decimal(10,2) NOT NULL, \`arrival_date\` date NOT NULL, \`expiration_date\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`IDX_5a44f1fa9340ad2c374c7042f8\` (\`product_id\`, \`reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule_zone_priority_config\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rule_id\` int NOT NULL, \`priority_level\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1f58b4d681ca5e21967107db1c\` (\`rule_id\`), UNIQUE INDEX \`REL_1f58b4d681ca5e21967107db1c\` (\`rule_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule_zone_priority_palettier\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`palettier_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule_product_incompatibility_config\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rule_id\` int NOT NULL, \`category\` varchar(100) NOT NULL, \`minimum_distance\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4b5ed5c86522a837d06d61a6d1\` (\`rule_id\`), UNIQUE INDEX \`REL_4b5ed5c86522a837d06d61a6d1\` (\`rule_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule_storage_condition_config\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rule_id\` int NOT NULL, \`condition_type\` varchar(100) NOT NULL, \`selection_mode\` enum ('palettier_type', 'specific_palettier') NOT NULL, \`palettier_type_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_aa8b6c6a0ab1c84f6cfab0a0da\` (\`rule_id\`), UNIQUE INDEX \`REL_aa8b6c6a0ab1c84f6cfab0a0da\` (\`rule_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule_storage_condition_palettier\` (\`id\` int NOT NULL AUTO_INCREMENT, \`config_id\` int NOT NULL, \`palettier_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule_placement_constraint_config\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rule_id\` int NOT NULL, \`constraint_type\` enum ('ground_only', 'max_height') NOT NULL, \`max_height\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ff25b40e9dc0a401c271cfd670\` (\`rule_id\`), UNIQUE INDEX \`REL_ff25b40e9dc0a401c271cfd670\` (\`rule_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`rule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`type\` enum ('zone_priority', 'product_incompatibility', 'storage_condition', 'placement_constraint') NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`product_rule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`rule_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ca4f4907b4a0df50ed8149c4bb\` (\`product_id\`, \`rule_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reference\` varchar(100) NOT NULL, \`name\` varchar(255) NOT NULL, \`unit_of_measure_id\` int NOT NULL, \`minimum_stock\` decimal(10,2) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_0d99c5ecda0104bc04f6780ccf\` (\`reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`unit_of_measure\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`abbreviation\` varchar(10) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`company_settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`language\` varchar(10) NOT NULL DEFAULT 'fr', \`timezone\` varchar(50) NOT NULL DEFAULT 'Europe/Paris', \`branding_logo_url\` varchar(500) NULL, \`primary_color\` varchar(20) NULL, \`secondary_color\` varchar(20) NULL, \`contact_email\` varchar(255) NULL, \`contact_phone\` varchar(50) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`palettier\` ADD CONSTRAINT \`FK_8e5f1d1a2bf85d5b7cc07eb92cb\` FOREIGN KEY (\`palettier_type_id\`) REFERENCES \`palettier_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`palette\` ADD CONSTRAINT \`FK_72c5d27b3251c3330cea2885d70\` FOREIGN KEY (\`palettier_id\`) REFERENCES \`palettier\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`palette_lot\` ADD CONSTRAINT \`FK_79b3c6097b02f0ee18bc170c46b\` FOREIGN KEY (\`palette_id\`) REFERENCES \`palette\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`palette_lot\` ADD CONSTRAINT \`FK_ce2d2f8f6afe8dab8c7dabda817\` FOREIGN KEY (\`lot_id\`) REFERENCES \`lot\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`lot\` ADD CONSTRAINT \`FK_e79764f0f61ae488d54f3170923\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_zone_priority_config\` ADD CONSTRAINT \`FK_1f58b4d681ca5e21967107db1c0\` FOREIGN KEY (\`rule_id\`) REFERENCES \`rule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_zone_priority_palettier\` ADD CONSTRAINT \`FK_4315fdd9dcdc5583ae204562ca4\` FOREIGN KEY (\`config_id\`) REFERENCES \`rule_zone_priority_config\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_zone_priority_palettier\` ADD CONSTRAINT \`FK_bba58fb91c3a1620090b4665c31\` FOREIGN KEY (\`palettier_id\`) REFERENCES \`palettier\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` ADD CONSTRAINT \`FK_4b5ed5c86522a837d06d61a6d12\` FOREIGN KEY (\`rule_id\`) REFERENCES \`rule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_config\` ADD CONSTRAINT \`FK_aa8b6c6a0ab1c84f6cfab0a0daa\` FOREIGN KEY (\`rule_id\`) REFERENCES \`rule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_config\` ADD CONSTRAINT \`FK_3e3fc6e7c951da5a90ce072bcc4\` FOREIGN KEY (\`palettier_type_id\`) REFERENCES \`palettier_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_palettier\` ADD CONSTRAINT \`FK_85ccf65b4b9890048e6e070cc6e\` FOREIGN KEY (\`config_id\`) REFERENCES \`rule_storage_condition_config\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_palettier\` ADD CONSTRAINT \`FK_31e8e1c906e996bd3efc9da906a\` FOREIGN KEY (\`palettier_id\`) REFERENCES \`palettier\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_placement_constraint_config\` ADD CONSTRAINT \`FK_ff25b40e9dc0a401c271cfd670a\` FOREIGN KEY (\`rule_id\`) REFERENCES \`rule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`product_rule\` ADD CONSTRAINT \`FK_933e529047124db4f766f286de3\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`product_rule\` ADD CONSTRAINT \`FK_75e127525d0142657e8c8d11ffb\` FOREIGN KEY (\`rule_id\`) REFERENCES \`rule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD CONSTRAINT \`FK_df01c0134a3c2b4d6aaf694a0a6\` FOREIGN KEY (\`unit_of_measure_id\`) REFERENCES \`unit_of_measure\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_df01c0134a3c2b4d6aaf694a0a6\``
    );
    await queryRunner.query(
      `ALTER TABLE \`product_rule\` DROP FOREIGN KEY \`FK_75e127525d0142657e8c8d11ffb\``
    );
    await queryRunner.query(
      `ALTER TABLE \`product_rule\` DROP FOREIGN KEY \`FK_933e529047124db4f766f286de3\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_placement_constraint_config\` DROP FOREIGN KEY \`FK_ff25b40e9dc0a401c271cfd670a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_palettier\` DROP FOREIGN KEY \`FK_31e8e1c906e996bd3efc9da906a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_palettier\` DROP FOREIGN KEY \`FK_85ccf65b4b9890048e6e070cc6e\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_config\` DROP FOREIGN KEY \`FK_3e3fc6e7c951da5a90ce072bcc4\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_storage_condition_config\` DROP FOREIGN KEY \`FK_aa8b6c6a0ab1c84f6cfab0a0daa\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_product_incompatibility_config\` DROP FOREIGN KEY \`FK_4b5ed5c86522a837d06d61a6d12\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_zone_priority_palettier\` DROP FOREIGN KEY \`FK_bba58fb91c3a1620090b4665c31\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_zone_priority_palettier\` DROP FOREIGN KEY \`FK_4315fdd9dcdc5583ae204562ca4\``
    );
    await queryRunner.query(
      `ALTER TABLE \`rule_zone_priority_config\` DROP FOREIGN KEY \`FK_1f58b4d681ca5e21967107db1c0\``
    );
    await queryRunner.query(
      `ALTER TABLE \`lot\` DROP FOREIGN KEY \`FK_e79764f0f61ae488d54f3170923\``
    );
    await queryRunner.query(
      `ALTER TABLE \`palette_lot\` DROP FOREIGN KEY \`FK_ce2d2f8f6afe8dab8c7dabda817\``
    );
    await queryRunner.query(
      `ALTER TABLE \`palette_lot\` DROP FOREIGN KEY \`FK_79b3c6097b02f0ee18bc170c46b\``
    );
    await queryRunner.query(
      `ALTER TABLE \`palette\` DROP FOREIGN KEY \`FK_72c5d27b3251c3330cea2885d70\``
    );
    await queryRunner.query(
      `ALTER TABLE \`palettier\` DROP FOREIGN KEY \`FK_8e5f1d1a2bf85d5b7cc07eb92cb\``
    );
    await queryRunner.query(`DROP TABLE \`company_settings\``);
    await queryRunner.query(`DROP TABLE \`unit_of_measure\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0d99c5ecda0104bc04f6780ccf\` ON \`product\``
    );
    await queryRunner.query(`DROP TABLE \`product\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ca4f4907b4a0df50ed8149c4bb\` ON \`product_rule\``
    );
    await queryRunner.query(`DROP TABLE \`product_rule\``);
    await queryRunner.query(`DROP TABLE \`rule\``);
    await queryRunner.query(
      `DROP INDEX \`REL_ff25b40e9dc0a401c271cfd670\` ON \`rule_placement_constraint_config\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ff25b40e9dc0a401c271cfd670\` ON \`rule_placement_constraint_config\``
    );
    await queryRunner.query(`DROP TABLE \`rule_placement_constraint_config\``);
    await queryRunner.query(`DROP TABLE \`rule_storage_condition_palettier\``);
    await queryRunner.query(
      `DROP INDEX \`REL_aa8b6c6a0ab1c84f6cfab0a0da\` ON \`rule_storage_condition_config\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_aa8b6c6a0ab1c84f6cfab0a0da\` ON \`rule_storage_condition_config\``
    );
    await queryRunner.query(`DROP TABLE \`rule_storage_condition_config\``);
    await queryRunner.query(
      `DROP INDEX \`REL_4b5ed5c86522a837d06d61a6d1\` ON \`rule_product_incompatibility_config\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4b5ed5c86522a837d06d61a6d1\` ON \`rule_product_incompatibility_config\``
    );
    await queryRunner.query(
      `DROP TABLE \`rule_product_incompatibility_config\``
    );
    await queryRunner.query(`DROP TABLE \`rule_zone_priority_palettier\``);
    await queryRunner.query(
      `DROP INDEX \`REL_1f58b4d681ca5e21967107db1c\` ON \`rule_zone_priority_config\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1f58b4d681ca5e21967107db1c\` ON \`rule_zone_priority_config\``
    );
    await queryRunner.query(`DROP TABLE \`rule_zone_priority_config\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5a44f1fa9340ad2c374c7042f8\` ON \`lot\``
    );
    await queryRunner.query(`DROP TABLE \`lot\``);
    await queryRunner.query(`DROP TABLE \`palette_lot\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ffd4557ace33f58a6f5f135f7e\` ON \`palette\``
    );
    await queryRunner.query(`DROP TABLE \`palette\``);
    await queryRunner.query(`DROP TABLE \`palettier\``);
    await queryRunner.query(`DROP TABLE \`palettier_type\``);
  }
}
