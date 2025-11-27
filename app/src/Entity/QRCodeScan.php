<?php

namespace App\Entity;

use App\Repository\QRCodeScanRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: QRCodeScanRepository::class)]
#[ORM\Table(name: 'qr_code_scan')]
class QRCodeScan
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME)]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: QRCode::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?QRCode $qrCode = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $scannedAt = null;

    #[ORM\Column(type: 'string', length: 64, nullable: true)]
    private ?string $fingerprint = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $metadata = null;

    public function __construct()
    {
        $this->id = Uuid::v4();
        $this->scannedAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getQrCode(): ?QRCode
    {
        return $this->qrCode;
    }

    public function setQrCode(?QRCode $qrCode): static
    {
        $this->qrCode = $qrCode;

        return $this;
    }

    public function getScannedAt(): ?\DateTimeImmutable
    {
        return $this->scannedAt;
    }

    public function setScannedAt(\DateTimeImmutable $scannedAt): static
    {
        $this->scannedAt = $scannedAt;

        return $this;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;

        return $this;
    }

    public function getFingerprint(): ?string
    {
        return $this->fingerprint;
    }

    public function setFingerprint(?string $fingerprint): static
    {
        $this->fingerprint = $fingerprint;

        return $this;
    }
}
