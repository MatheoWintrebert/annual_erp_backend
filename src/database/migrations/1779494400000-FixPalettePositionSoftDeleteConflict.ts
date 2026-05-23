import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPalettePositionSoftDeleteConflict1779494400000 implements MigrationInterface {
  name = "FixPalettePositionSoftDeleteConflict1779494400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`palette\` ADD \`position_lock\` BIGINT GENERATED ALWAYS AS (IF(\`deleted_at\` IS NULL, 0, TO_SECONDS(\`deleted_at\`))) VIRTUAL NOT NULL`
    );
    // Create new index before dropping old one — old index backs the palettier_id FK
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_palette_active_position\` ON \`palette\` (\`palettier_id\`, \`position_x\`, \`position_y\`, \`position_z\`, \`position_lock\`)`
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ffd4557ace33f58a6f5f135f7e\` ON \`palette\``
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore old index before dropping new one — new index backs the palettier_id FK
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_ffd4557ace33f58a6f5f135f7e\` ON \`palette\` (\`palettier_id\`, \`position_x\`, \`position_y\`, \`position_z\`)`
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_palette_active_position\` ON \`palette\``
    );
    await queryRunner.query(
      `ALTER TABLE \`palette\` DROP COLUMN \`position_lock\``
    );
  }
}
