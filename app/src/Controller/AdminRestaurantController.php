<?php

namespace App\Controller;

use App\Entity\Restaurant;
use App\Repository\RestaurantRepository;
use App\Repository\MenuRepository;
use App\Repository\QRCodeScanRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/admin')]
class AdminRestaurantController extends AbstractController
{
    public function __construct(
        private RestaurantRepository $restaurantRepository,
        private MenuRepository $menuRepository,
        private QRCodeScanRepository $qrCodeScanRepository,
        private EntityManagerInterface $entityManager,
        private string $uploadsDirectory
    ) {
    }

    #[Route('/restaurants', name: 'admin_restaurants', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = 20;
        $search = $request->query->get('search', '');

        $qb = $this->restaurantRepository->createQueryBuilder('r')
            ->leftJoin('r.owner', 'u')
            ->orderBy('r.createdAt', 'DESC');

        if ($search) {
            $qb->where('r.name ILIKE :search OR r.slug ILIKE :search OR u.phoneNumber ILIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $countQb = $this->restaurantRepository->createQueryBuilder('r')
            ->select('COUNT(DISTINCT r.id)');

        if ($search) {
            $countQb->leftJoin('r.owner', 'u')
                ->where('r.name ILIKE :search OR r.slug ILIKE :search OR u.phoneNumber ILIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $total = $countQb->getQuery()->getSingleScalarResult();
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
                'userPhone' => $restaurant->getOwner()?->getPhoneNumber(),
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

    #[Route('/restaurants/create', name: 'admin_restaurants_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $name = trim($request->request->get('name', ''));
        $description = trim($request->request->get('description', ''));

        if (empty($name)) {
            return new JsonResponse(['success' => false, 'error' => 'Le nom est requis'], 400);
        }

        $restaurant = new Restaurant();
        $restaurant->setName($name);
        if ($description) {
            $restaurant->setDescription($description);
        }

        /** @var UploadedFile|null $logoFile */
        $logoFile = $request->files->get('logo');
        if ($logoFile) {
            $filename = uniqid() . '.' . $logoFile->guessExtension();
            $logoFile->move($this->uploadsDirectory . '/restaurants', $filename);
            $restaurant->setPhotoPath('restaurants/' . $filename);
        }

        /** @var UploadedFile|null $backgroundFile */
        $backgroundFile = $request->files->get('background');
        if ($backgroundFile) {
            $filename = uniqid() . '.' . $backgroundFile->guessExtension();
            $backgroundFile->move($this->uploadsDirectory . '/restaurants', $filename);
            $restaurant->setBackgroundPhotoPath('restaurants/' . $filename);
        }

        $this->entityManager->persist($restaurant);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'restaurant' => [
                'id' => $restaurant->getId()->toRfc4122(),
                'name' => $restaurant->getName(),
                'slug' => $restaurant->getSlug(),
            ],
        ]);
    }

    #[Route('/restaurants/{id}', name: 'admin_restaurants_get', methods: ['GET'])]
    public function getRestaurant(string $id): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($id));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        return new JsonResponse([
            'success' => true,
            'restaurant' => [
                'id' => $restaurant->getId()->toRfc4122(),
                'name' => $restaurant->getName(),
                'slug' => $restaurant->getSlug(),
                'description' => $restaurant->getDescription(),
                'photoPath' => $restaurant->getPhotoPath(),
                'backgroundPhotoPath' => $restaurant->getBackgroundPhotoPath(),
            ],
        ]);
    }

    #[Route('/restaurants/{id}', name: 'admin_restaurants_update', methods: ['POST'])]
    public function updateRestaurant(string $id, Request $request): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($id));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $name = trim($request->request->get('name', ''));
        $description = trim($request->request->get('description', ''));

        if (empty($name)) {
            return new JsonResponse(['success' => false, 'error' => 'Le nom est requis'], 400);
        }

        $restaurant->setName($name);
        $restaurant->setDescription($description);

        /** @var UploadedFile|null $logoFile */
        $logoFile = $request->files->get('logo');
        if ($logoFile) {
            if ($restaurant->getPhotoPath()) {
                $oldPath = $this->uploadsDirectory . '/' . $restaurant->getPhotoPath();
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $filename = uniqid() . '.' . $logoFile->guessExtension();
            $logoFile->move($this->uploadsDirectory . '/restaurants', $filename);
            $restaurant->setPhotoPath('restaurants/' . $filename);
        }

        /** @var UploadedFile|null $backgroundFile */
        $backgroundFile = $request->files->get('background');
        if ($backgroundFile) {
            if ($restaurant->getBackgroundPhotoPath()) {
                $oldPath = $this->uploadsDirectory . '/' . $restaurant->getBackgroundPhotoPath();
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $filename = uniqid() . '.' . $backgroundFile->guessExtension();
            $backgroundFile->move($this->uploadsDirectory . '/restaurants', $filename);
            $restaurant->setBackgroundPhotoPath('restaurants/' . $filename);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'restaurant' => [
                'id' => $restaurant->getId()->toRfc4122(),
                'name' => $restaurant->getName(),
                'slug' => $restaurant->getSlug(),
                'description' => $restaurant->getDescription(),
                'photoPath' => $restaurant->getPhotoPath(),
                'backgroundPhotoPath' => $restaurant->getBackgroundPhotoPath(),
            ],
        ]);
    }

    #[Route('/restaurants/{id}/menus', name: 'admin_restaurants_menus', methods: ['GET'])]
    public function getMenus(string $id): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($id));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $menus = $this->menuRepository->createQueryBuilder('m')
            ->where('m.restaurant = :restaurant')
            ->setParameter('restaurant', $restaurant)
            ->orderBy('m.displayOrder', 'ASC')
            ->addOrderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();

        $menusData = array_map(function ($menu) {
            return [
                'id' => $menu->getId()->toRfc4122(),
                'name' => $menu->getName(),
                'type' => $menu->getType(),
                'filePath' => $menu->getFilePath(),
                'displayOrder' => $menu->getDisplayOrder(),
                'createdAt' => $menu->getCreatedAt()->format('c'),
            ];
        }, $menus);

        return new JsonResponse([
            'success' => true,
            'menus' => $menusData,
        ]);
    }

    #[Route('/restaurants/{id}/menus/reorder', name: 'admin_restaurants_menus_reorder', methods: ['POST'])]
    public function reorderMenus(string $id, Request $request): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($id));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $order = $data['order'] ?? [];

        foreach ($order as $index => $menuId) {
            $menu = $this->menuRepository->find(Uuid::fromString($menuId));
            if ($menu && $menu->getRestaurant()->getId()->equals($restaurant->getId())) {
                $menu->setDisplayOrder($index);
            }
        }

        $this->entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/restaurants/{restaurantId}/menus/create', name: 'admin_restaurants_menus_create', methods: ['POST'])]
    public function createMenu(string $restaurantId, Request $request): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($restaurantId));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $name = trim($request->request->get('name', ''));
        $type = $request->request->get('type', '');

        if (empty($name)) {
            return new JsonResponse(['success' => false, 'error' => 'Le nom est requis'], 400);
        }

        if (!in_array($type, ['pdf', 'image'])) {
            return new JsonResponse(['success' => false, 'error' => 'Type invalide'], 400);
        }

        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');
        if (!$file) {
            return new JsonResponse(['success' => false, 'error' => 'Le fichier est requis'], 400);
        }

        if ($type === 'pdf' && $file->getMimeType() !== 'application/pdf') {
            return new JsonResponse(['success' => false, 'error' => 'Le fichier doit être un PDF'], 400);
        }

        if ($type === 'image' && !str_starts_with($file->getMimeType(), 'image/')) {
            return new JsonResponse(['success' => false, 'error' => 'Le fichier doit être une image'], 400);
        }

        $filename = uniqid() . '.' . $file->guessExtension();
        $restaurantDir = $this->uploadsDirectory . '/menus/' . $restaurant->getId();

        if (!is_dir($restaurantDir)) {
            mkdir($restaurantDir, 0755, true);
        }

        $file->move($restaurantDir, $filename);

        $menu = new \App\Entity\Menu();
        $menu->setName($name);
        $menu->setType($type);
        $menu->setFilePath('menus/' . $restaurant->getId() . '/' . $filename);
        $menu->setRestaurant($restaurant);

        $maxOrder = $this->menuRepository->createQueryBuilder('m')
            ->select('MAX(m.displayOrder)')
            ->where('m.restaurant = :restaurant')
            ->setParameter('restaurant', $restaurant)
            ->getQuery()
            ->getSingleScalarResult();

        $menu->setDisplayOrder(($maxOrder ?? -1) + 1);

        $this->entityManager->persist($menu);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'menu' => [
                'id' => $menu->getId()->toRfc4122(),
                'name' => $menu->getName(),
                'type' => $menu->getType(),
                'filePath' => $menu->getFilePath(),
                'displayOrder' => $menu->getDisplayOrder(),
                'createdAt' => $menu->getCreatedAt()->format('c'),
            ],
        ]);
    }

    #[Route('/restaurants/{restaurantId}/menus/{menuId}', name: 'admin_restaurants_menus_update', methods: ['POST'])]
    public function updateMenu(string $restaurantId, string $menuId, Request $request): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($restaurantId));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $menu = $this->menuRepository->find(Uuid::fromString($menuId));
        if (!$menu || !$menu->getRestaurant()->getId()->equals($restaurant->getId())) {
            return new JsonResponse(['success' => false, 'error' => 'Menu non trouvé'], 404);
        }

        $name = trim($request->request->get('name', ''));
        if (empty($name)) {
            return new JsonResponse(['success' => false, 'error' => 'Le nom est requis'], 400);
        }

        $menu->setName($name);
        $menu->setUpdatedAt(new \DateTimeImmutable());

        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');
        if ($file) {
            $type = $menu->getType();

            if ($type === 'pdf' && $file->getMimeType() !== 'application/pdf') {
                return new JsonResponse(['success' => false, 'error' => 'Le fichier doit être un PDF'], 400);
            }

            if ($type === 'image' && !str_starts_with($file->getMimeType(), 'image/')) {
                return new JsonResponse(['success' => false, 'error' => 'Le fichier doit être une image'], 400);
            }

            $oldFilePath = $this->uploadsDirectory . '/' . $menu->getFilePath();
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }

            $filename = uniqid() . '.' . $file->guessExtension();
            $restaurantDir = $this->uploadsDirectory . '/menus/' . $restaurant->getId();

            if (!is_dir($restaurantDir)) {
                mkdir($restaurantDir, 0755, true);
            }

            $file->move($restaurantDir, $filename);
            $menu->setFilePath('menus/' . $restaurant->getId() . '/' . $filename);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'menu' => [
                'id' => $menu->getId()->toRfc4122(),
                'name' => $menu->getName(),
                'type' => $menu->getType(),
                'filePath' => $menu->getFilePath(),
                'displayOrder' => $menu->getDisplayOrder(),
            ],
        ]);
    }

    #[Route('/restaurants/{restaurantId}/menus/{menuId}', name: 'admin_restaurants_menus_delete', methods: ['DELETE'])]
    public function deleteMenu(string $restaurantId, string $menuId): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($restaurantId));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $menu = $this->menuRepository->find(Uuid::fromString($menuId));
        if (!$menu || !$menu->getRestaurant()->getId()->equals($restaurant->getId())) {
            return new JsonResponse(['success' => false, 'error' => 'Menu non trouvé'], 404);
        }

        $filePath = $this->uploadsDirectory . '/' . $menu->getFilePath();
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $this->entityManager->remove($menu);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/restaurants/{id}/scans', name: 'admin_restaurants_scans', methods: ['GET'])]
    public function getScans(string $id, Request $request): JsonResponse
    {
        $restaurant = $this->restaurantRepository->find(Uuid::fromString($id));
        if (!$restaurant) {
            return new JsonResponse(['success' => false, 'error' => 'Restaurant non trouvé'], 404);
        }

        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = 50;

        $qb = $this->qrCodeScanRepository->createQueryBuilder('s')
            ->leftJoin('s.qrCode', 'q')
            ->leftJoin('q.restaurant', 'r')
            ->where('r.id = :restaurantId')
            ->setParameter('restaurantId', $restaurant->getId())
            ->orderBy('s.scannedAt', 'DESC')
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage);

        $scans = $qb->getQuery()->getResult();

        $countQb = $this->qrCodeScanRepository->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->leftJoin('s.qrCode', 'q')
            ->leftJoin('q.restaurant', 'r')
            ->where('r.id = :restaurantId')
            ->setParameter('restaurantId', $restaurant->getId());

        $total = $countQb->getQuery()->getSingleScalarResult();

        $scansData = array_map(function ($scan) {
            $qrCode = $scan->getQrCode();
            return [
                'id' => $scan->getId()->toRfc4122(),
                'scannedAt' => $scan->getScannedAt()->format('c'),
                'metadata' => $scan->getMetadata(),
                'qrCode' => [
                    'code' => $qrCode->getCode(),
                    'tableName' => $qrCode->getTableName(),
                ],
            ];
        }, $scans);

        return new JsonResponse([
            'success' => true,
            'scans' => $scansData,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => ceil($total / $perPage),
        ]);
    }
}
