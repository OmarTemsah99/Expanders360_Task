import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncMigration1756199672871 implements MigrationInterface {
  name = 'SyncMigration1756199672871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`vendors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`countries_supported\` text NOT NULL, \`services_offered\` text NOT NULL, \`rating\` decimal(2,1) NOT NULL, \`response_sla_hours\` int NOT NULL, INDEX \`IDX_vendors_rating\` (\`rating\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`matches\` (\`id\` int NOT NULL AUTO_INCREMENT, \`score\` decimal(5,2) NOT NULL COMMENT 'Matching score (0.00 - 100.00)', \`matchDetails\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`project_id\` varchar(36) NULL, \`vendor_id\` int NULL, INDEX \`IDX_matches_created_at\` (\`created_at\`), INDEX \`IDX_matches_score\` (\`score\`), UNIQUE INDEX \`UQ_match_project_vendor\` (\`project_id\`, \`vendor_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`projects\` (\`id\` varchar(36) NOT NULL, \`country\` varchar(255) NOT NULL, \`services_needed\` text NOT NULL, \`budget\` decimal(12,2) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'active', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`client_id\` int NULL, INDEX \`IDX_projects_status\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`clients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`company_name\` varchar(255) NOT NULL, \`contact_email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'client', UNIQUE INDEX \`IDX_4253ee2b695fdcf143cfc5a7cc\` (\`contact_email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`matches\` ADD CONSTRAINT \`FK_416d7b6f94de26244a7be38d87a\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`matches\` ADD CONSTRAINT \`FK_dfb298e37d26ca75c3b1b1c8010\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_ca29f959102228649e714827478\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_ca29f959102228649e714827478\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`matches\` DROP FOREIGN KEY \`FK_dfb298e37d26ca75c3b1b1c8010\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`matches\` DROP FOREIGN KEY \`FK_416d7b6f94de26244a7be38d87a\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4253ee2b695fdcf143cfc5a7cc\` ON \`clients\``,
    );
    await queryRunner.query(`DROP TABLE \`clients\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_projects_status\` ON \`projects\``,
    );
    await queryRunner.query(`DROP TABLE \`projects\``);
    await queryRunner.query(
      `DROP INDEX \`UQ_match_project_vendor\` ON \`matches\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_matches_score\` ON \`matches\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_matches_created_at\` ON \`matches\``,
    );
    await queryRunner.query(`DROP TABLE \`matches\``);
    await queryRunner.query(`DROP INDEX \`IDX_vendors_rating\` ON \`vendors\``);
    await queryRunner.query(`DROP TABLE \`vendors\``);
  }
}
