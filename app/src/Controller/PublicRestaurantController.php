<?php

namespace App\Controller;

use App\Entity\Menu;
use App\Entity\Restaurant;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PublicRestaurantController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/restaurant/{slug}', name: 'public_restaurant')]
    public function show(string $slug): Response
    {
        $restaurant = $this->entityManager
            ->getRepository(Restaurant::class)
            ->findOneBy(['slug' => $slug]);

        if (!$restaurant) {
            throw $this->createNotFoundException('Restaurant non trouvé');
        }

        $menus = $this->entityManager
            ->getRepository(Menu::class)
            ->findBy(['restaurant' => $restaurant], ['createdAt' => 'DESC']);

        return $this->render('public/restaurant.html.twig', [
            'restaurant' => $restaurant,
            'menus' => $menus,
        ]);
    }
}
