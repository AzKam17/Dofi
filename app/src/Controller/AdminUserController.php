<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin')]
class AdminUserController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    #[Route('/users', name: 'admin_users', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = 20;
        $search = $request->query->get('search', '');

        $qb = $this->userRepository->createQueryBuilder('u')
            ->leftJoin('u.restaurant', 'r')
            ->orderBy('u.createdAt', 'DESC');

        if ($search) {
            $qb->where('u.phoneNumber ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search OR r.name ILIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $countQb = $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(DISTINCT u.id)');

        if ($search) {
            $countQb->leftJoin('u.restaurant', 'r')
                ->where('u.phoneNumber ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search OR r.name ILIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $total = $countQb->getQuery()->getSingleScalarResult();
        $totalPages = max(1, (int) ceil($total / $perPage));

        $users = $qb
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $usersData = array_map(function ($user) {
            $restaurant = $user->getRestaurant();
            return [
                'id' => $user->getId()->toRfc4122(),
                'phoneNumber' => $user->getPhoneNumber(),
                'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                'restaurantName' => $restaurant ? $restaurant->getName() : '-',
                'createdAt' => $user->getCreatedAt()->format('c'),
            ];
        }, $users);

        return $this->render('admin/users.html.twig', [
            'users' => json_encode($usersData),
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'search' => $search,
            'total' => $total,
        ]);
    }
}
