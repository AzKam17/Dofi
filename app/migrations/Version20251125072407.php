<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251125072407 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE restaurant ADD description TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE restaurant ADD photo_path VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE restaurant ADD background_photo_path VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE restaurant ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE restaurant DROP description');
        $this->addSql('ALTER TABLE restaurant DROP photo_path');
        $this->addSql('ALTER TABLE restaurant DROP background_photo_path');
        $this->addSql('ALTER TABLE restaurant DROP updated_at');
    }
}
