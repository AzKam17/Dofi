<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251126145855 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX uniq_880e0d76e7927c74');
        $this->addSql('ALTER TABLE admin ADD phone_number VARCHAR(20) NOT NULL');
        $this->addSql('ALTER TABLE admin ADD otp_code VARCHAR(6) DEFAULT NULL');
        $this->addSql('ALTER TABLE admin ADD otp_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE admin DROP email');
        $this->addSql('ALTER TABLE admin DROP roles');
        $this->addSql('ALTER TABLE admin DROP password');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_880E0D766B01BC5B ON admin (phone_number)');
        $this->addSql('ALTER TABLE "user" ADD is_admin BOOLEAN DEFAULT false NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_880E0D766B01BC5B');
        $this->addSql('ALTER TABLE admin ADD email VARCHAR(180) NOT NULL');
        $this->addSql('ALTER TABLE admin ADD roles JSON NOT NULL');
        $this->addSql('ALTER TABLE admin ADD password VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE admin DROP phone_number');
        $this->addSql('ALTER TABLE admin DROP otp_code');
        $this->addSql('ALTER TABLE admin DROP otp_expires_at');
        $this->addSql('CREATE UNIQUE INDEX uniq_880e0d76e7927c74 ON admin (email)');
        $this->addSql('ALTER TABLE "user" DROP is_admin');
    }
}
