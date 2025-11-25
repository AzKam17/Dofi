<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251125075351 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE qr_code_scan (id UUID NOT NULL, scanned_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, metadata JSON DEFAULT NULL, qr_code_id UUID NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE INDEX IDX_3E3AF0C212E4AD80 ON qr_code_scan (qr_code_id)');
        $this->addSql('ALTER TABLE qr_code_scan ADD CONSTRAINT FK_3E3AF0C212E4AD80 FOREIGN KEY (qr_code_id) REFERENCES qr_code (id) NOT DEFERRABLE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE qr_code_scan DROP CONSTRAINT FK_3E3AF0C212E4AD80');
        $this->addSql('DROP TABLE qr_code_scan');
    }
}
