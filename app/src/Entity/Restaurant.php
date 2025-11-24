<?php

namespace App\Entity;

use App\Repository\RestaurantRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\String\Slugger\AsciiSlugger;

#[ORM\Entity(repositoryClass: RestaurantRepository::class)]
#[ORM\Table(name: 'restaurant')]
#[ORM\HasLifecycleCallbacks]
class Restaurant
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $slug = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToOne(mappedBy: 'restaurant', targetEntity: User::class)]
    private ?User $owner = null;

    public function __construct()
    {
        $this->id = Uuid::v4();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

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

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        if ($owner === null && $this->owner !== null) {
            $this->owner->setRestaurant(null);
        }

        if ($owner !== null && $owner->getRestaurant() !== $this) {
            $owner->setRestaurant($this);
        }

        $this->owner = $owner;

        return $this;
    }

    #[ORM\PrePersist]
    public function generateSlug(): void
    {
        if ($this->name && !$this->slug) {
            $slugger = new AsciiSlugger();
            $this->slug = $slugger->slug($this->name)->lower()->toString();
        }
    }
}
