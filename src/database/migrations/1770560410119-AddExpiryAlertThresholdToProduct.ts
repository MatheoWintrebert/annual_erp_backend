import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpiryAlertThresholdToProduct1770560410119 implements MigrationInterface {
  name = "AddExpiryAlertThresholdToProduct1770560410119";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`expiry_alert_threshold\` int NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`expiry_alert_threshold\``
    );
  }
}
