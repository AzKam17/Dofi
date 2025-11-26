<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\RestaurantRepository;
use App\Repository\QRCodeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminDashboardController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private RestaurantRepository $restaurantRepository,
        private QRCodeRepository $qrCodeRepository
    ) {
    }

    #[Route('/admin', name: 'admin_dashboard')]
    public function index(): Response
    {
        $totalUsers = $this->userRepository->count([]);
        $totalRestaurants = $this->restaurantRepository->count([]);
        $totalQRCodes = $this->qrCodeRepository->count([]);

        $assignedQRCodes = $this->qrCodeRepository->createQueryBuilder('q')
            ->select('COUNT(q.id)')
            ->where('q.restaurant IS NOT NULL')
            ->getQuery()
            ->getSingleScalarResult();

        $unassignedQRCodes = $totalQRCodes - $assignedQRCodes;

        return $this->render('admin/dashboard.html.twig', [
            'stats' => json_encode([
                'totalUsers' => $totalUsers,
                'totalRestaurants' => $totalRestaurants,
                'totalQRCodes' => $totalQRCodes,
                'assignedQRCodes' => $assignedQRCodes,
                'unassignedQRCodes' => $unassignedQRCodes,
            ]),
        ]);
    }
}
