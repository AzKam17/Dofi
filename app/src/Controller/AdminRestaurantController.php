<?php

namespace App\Controller;

use App\Repository\RestaurantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin')]
class AdminRestaurantController extends AbstractController
{
    public function __construct(
        private RestaurantRepository $restaurantRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    #[Route('/restaurants', name: 'admin_restaurants', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = 20;
        $search = $request->query->get('search', '');

        $qb = $this->restaurantRepository->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->orderBy('r.createdAt', 'DESC');

        if ($search) {
            $qb->where('r.name ILIKE :search OR r.slug ILIKE :search OR u.phoneNumber ILIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $totalQuery = clone $qb;
        $total = $totalQuery->select('COUNT(r.id)')->getQuery()->getSingleScalarResult();
        $totalPages = max(1, (int) ceil($total / $perPage));

        $restaurants = $qb
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $restaurantsData = array_map(function ($restaurant) {
            return [
                'id' => $restaurant->getId()->toRfc4122(),
                'name' => $restaurant->getName(),
                'slug' => $restaurant->getSlug(),
                'userPhone' => $restaurant->getUser()?->getPhoneNumber(),
                'createdAt' => $restaurant->getCreatedAt()->format('c'),
            ];
        }, $restaurants);

        return $this->render('admin/restaurants.html.twig', [
            'restaurants' => json_encode($restaurantsData),
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'search' => $search,
            'total' => $total,
        ]);
    }
}
