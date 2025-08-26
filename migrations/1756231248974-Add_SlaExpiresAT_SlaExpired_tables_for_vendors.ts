import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlaExpiresATSlaExpiredTablesForVendors1756231248974
  implements MigrationInterface
{
  name = 'AddSlaExpiresATSlaExpiredTablesForVendors1756231248974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vendors\` ADD \`sla_expires_at\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vendors\` ADD \`sla_expired\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vendors\` DROP COLUMN \`sla_expired\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vendors\` DROP COLUMN \`sla_expires_at\``,
    );
  }
}
