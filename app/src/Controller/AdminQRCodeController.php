<?php

namespace App\Controller;

use App\Entity\QRCode;
use App\Repository\QRCodeRepository;
use App\Repository\RestaurantRepository;
use App\Command\GenerateQRCodesCommand;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/admin')]
class AdminQRCodeController extends AbstractController
{
    public function __construct(
        private QRCodeRepository $qrCodeRepository,
        private RestaurantRepository $restaurantRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    #[Route('/qrcodes', name: 'admin_qrcodes', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = 20;
        $search = $request->query->get('search', '');
        $filter = $request->query->get('filter', 'all'); // all, assigned, unassigned

        $qb = $this->qrCodeRepository->createQueryBuilder('q')
            ->leftJoin('q.restaurant', 'r')
            ->orderBy('q.createdAt', 'DESC');

        if ($search) {
            $qb->where('q.code ILIKE :search OR q.tableName ILIKE :search OR r.name ILIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        if ($filter === 'assigned') {
            $qb->andWhere('q.restaurant IS NOT NULL');
        } elseif ($filter === 'unassigned') {
            $qb->andWhere('q.restaurant IS NULL');
        }

        $totalQuery = clone $qb;
        $total = $totalQuery->select('COUNT(q.id)')->getQuery()->getSingleScalarResult();
        $totalPages = max(1, (int) ceil($total / $perPage));

        $qrCodes = $qb
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $qrCodesData = array_map(function ($qrCode) {
            return [
                'id' => $qrCode->getId()->toRfc4122(),
                'code' => $qrCode->getCode(),
                'tableName' => $qrCode->getTableName(),
                'restaurantId' => $qrCode->getRestaurant()?->getId()->toRfc4122(),
                'restaurantName' => $qrCode->getRestaurant()?->getName(),
                'createdAt' => $qrCode->getCreatedAt()->format('c'),
            ];
        }, $qrCodes);

        // Get all restaurants for assignment dropdown
        $restaurants = $this->restaurantRepository->findAll();
        $restaurantsData = array_map(function ($restaurant) {
            return [
                'id' => $restaurant->getId()->toRfc4122(),
                'name' => $restaurant->getName(),
            ];
        }, $restaurants);

        return $this->render('admin/qrcodes.html.twig', [
            'qrCodes' => json_encode($qrCodesData),
            'restaurants' => json_encode($restaurantsData),
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'search' => $search,
            'filter' => $filter,
            'total' => $total,
        ]);
    }

    #[Route('/qrcodes/generate', name: 'admin_qrcodes_generate', methods: ['POST'])]
    public function generate(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $count = (int) ($data['count'] ?? 10);
        $count = min(max(1, $count), 1000); // Limit between 1 and 1000

        $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $generated = 0;

        for ($i = 0; $i < $count; $i++) {
            do {
                $code = '';
                for ($j = 0; $j < 5; $j++) {
                    $code .= $characters[random_int(0, strlen($characters) - 1)];
                }
                $existing = $this->qrCodeRepository->findOneBy(['code' => $code]);
            } while ($existing !== null);

            $qrCode = new QRCode();
            $qrCode->setCode($code);
            $this->entityManager->persist($qrCode);
            $generated++;

            if (($i + 1) % 100 === 0) {
                $this->entityManager->flush();
                $this->entityManager->clear();
            }
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'generated' => $generated,
        ]);
    }

    #[Route('/qrcodes/{id}/assign', name: 'admin_qrcodes_assign', methods: ['POST'])]
    public function assign(string $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $restaurantId = $data['restaurantId'] ?? null;
        $tableName = $data['tableName'] ?? null;

        $qrCode = $this->qrCodeRepository->find(Uuid::fromString($id));
        if (!$qrCode) {
            return new JsonResponse(['success' => false, 'error' => 'QR Code non trouvé'], 404);
        }

        if ($restaurantId) {
            $restaurant = $this->restaurantRepository->find(Uuid::fromString($restaurantId));
            if (!$restaurant) {
                return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
            }
            $qrCode->setRestaurant($restaurant);
        } else {
            $qrCode->setRestaurant(null);
        }

        $qrCode->setTableName($tableName);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/qrcodes/{id}/unassign', name: 'admin_qrcodes_unassign', methods: ['POST'])]
    public function unassign(string $id): JsonResponse
    {
        $qrCode = $this->qrCodeRepository->find(Uuid::fromString($id));
        if (!$qrCode) {
            return new JsonResponse(['success' => false, 'error' => 'QR Code non trouvé'], 404);
        }

        $qrCode->setRestaurant(null);
        $qrCode->setTableName(null);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true]);
    }
}
