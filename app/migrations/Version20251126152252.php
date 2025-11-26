<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251126152252 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notification DROP CONSTRAINT fk_notification_user');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE');
        $this->addSql('ALTER INDEX idx_notification_user RENAME TO IDX_BF5476CAA76ED395');
        $this->addSql('ALTER TABLE qr_code ADD last_scanned_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE qr_code ADD total_scans INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE qr_code ADD scans_today INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE qr_code ADD last_scan_date DATE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notification DROP CONSTRAINT FK_BF5476CAA76ED395');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_bf5476caa76ed395 RENAME TO idx_notification_user');
        $this->addSql('ALTER TABLE qr_code DROP last_scanned_at');
        $this->addSql('ALTER TABLE qr_code DROP total_scans');
        $this->addSql('ALTER TABLE qr_code DROP scans_today');
        $this->addSql('ALTER TABLE qr_code DROP last_scan_date');
    }
}
