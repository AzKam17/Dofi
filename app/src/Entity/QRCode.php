<?php

namespace App\Entity;

use App\Repository\QRCodeRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: QRCodeRepository::class)]
#[ORM\Table(name: 'qr_code')]
#[ORM\HasLifecycleCallbacks]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt', timeAware: false)]
class QRCode
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME)]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: Restaurant::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Restaurant $restaurant = null;

    #[ORM\Column(length: 5, unique: true)]
    private ?string $code = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $tableName = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $metadata = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $deletedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $lastScannedAt = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $totalScans = 0;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $scansToday = 0;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $lastScanDate = null;

    public function __construct()
    {
        $this->id = Uuid::v4();
        $this->createdAt = new \DateTimeImmutable();
        $this->totalScans = 0;
        $this->scansToday = 0;
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getRestaurant(): ?Restaurant
    {
        return $this->restaurant;
    }

    public function setRestaurant(?Restaurant $restaurant): static
    {
        $this->restaurant = $restaurant;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getTableName(): ?string
    {
        return $this->tableName;
    }

    public function setTableName(?string $tableName): static
    {
        $this->tableName = $tableName;

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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }

    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getLastScannedAt(): ?\DateTimeImmutable
    {
        return $this->lastScannedAt;
    }

    public function setLastScannedAt(?\DateTimeImmutable $lastScannedAt): static
    {
        $this->lastScannedAt = $lastScannedAt;

        return $this;
    }

    public function getTotalScans(): int
    {
        return $this->totalScans;
    }

    public function setTotalScans(int $totalScans): static
    {
        $this->totalScans = $totalScans;

        return $this;
    }

    public function getScansToday(): int
    {
        return $this->scansToday;
    }

    public function setScansToday(int $scansToday): static
    {
        $this->scansToday = $scansToday;

        return $this;
    }

    public function getLastScanDate(): ?\DateTimeImmutable
    {
        return $this->lastScanDate;
    }

    public function setLastScanDate(?\DateTimeImmutable $lastScanDate): static
    {
        $this->lastScanDate = $lastScanDate;

        return $this;
    }

    public function incrementScans(): void
    {
        $now = new \DateTimeImmutable();
        $today = \DateTime::createFromFormat('Y-m-d', $now->format('Y-m-d'));
        $today->setTime(0, 0, 0);
        $todayImmutable = \DateTimeImmutable::createFromMutable($today);

        $this->totalScans++;
        $this->lastScannedAt = $now;

        if ($this->lastScanDate === null || $this->lastScanDate->format('Y-m-d') !== $todayImmutable->format('Y-m-d')) {
            $this->scansToday = 1;
            $this->lastScanDate = $todayImmutable;
        } else {
            $this->scansToday++;
        }
    }
}
