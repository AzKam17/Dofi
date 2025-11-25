<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251125074617 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE qr_code ADD code VARCHAR(5) NOT NULL');
        $this->addSql('ALTER TABLE qr_code ALTER restaurant_id DROP NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7D8B1FB577153098 ON qr_code (code)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_7D8B1FB577153098');
        $this->addSql('ALTER TABLE qr_code DROP code');
        $this->addSql('ALTER TABLE qr_code ALTER restaurant_id SET NOT NULL');
    }
}
