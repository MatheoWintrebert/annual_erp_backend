import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Initial1769425630332 implements MigrationInterface {
    name = 'Initial1769425630332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "user",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "last_name",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "first_name",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "255",
                    isUnique: true,
                },
                {
                    name: "password",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "is_active",
                    type: "boolean",
                    default: true,
                },
                {
                    name: "two_factor_secret",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "is_two_factor_enabled",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "backup_codes",
                    type: "json",
                    isNullable: true,
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP(6)",
                },
                {
                    name: "updated_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP(6)",
                    onUpdate: "CURRENT_TIMESTAMP(6)",
                },
            ],
        }));

        await queryRunner.createTable(new Table({
            name: "custom",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "logo",
                    type: "varchar",
                    length: "255",
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
        await queryRunner.dropTable("custom");
    }

}
