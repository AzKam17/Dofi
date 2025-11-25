<?php

namespace App\Controller;

use App\Entity\Menu;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/menu')]
class MenuController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger,
        private SluggerInterface $slugger,
        private string $uploadsDirectory
    ) {}

    #[Route('/create', name: 'menu_create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $restaurant = $user->getRestaurant();
        if (!$restaurant) {
            return $this->json(['success' => false, 'message' => 'Restaurant non trouvé'], 404);
        }

        $name = $request->request->get('name');
        $type = $request->request->get('type');
        $file = $request->files->get('file');

        if (!$name || !$type) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom et le type sont requis'
            ], 400);
        }

        if (!in_array($type, ['pdf', 'image'])) {
            return $this->json([
                'success' => false,
                'message' => 'Type de menu invalide'
            ], 400);
        }

        if (!$file) {
            return $this->json([
                'success' => false,
                'message' => 'Le fichier est requis'
            ], 400);
        }

        // Validate file type
        if ($type === 'pdf' && $file->getMimeType() !== 'application/pdf') {
            return $this->json([
                'success' => false,
                'message' => 'Le fichier doit être un PDF'
            ], 400);
        }

        if ($type === 'image' && !str_starts_with($file->getMimeType(), 'image/')) {
            return $this->json([
                'success' => false,
                'message' => 'Le fichier doit être une image'
            ], 400);
        }

        try {
            // Generate unique filename
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $extension = $file->guessExtension();
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $extension;

            // Create restaurant-specific directory
            $restaurantDir = $this->uploadsDirectory . '/menus/' . $restaurant->getId();
            if (!is_dir($restaurantDir)) {
                mkdir($restaurantDir, 0755, true);
            }

            // Move the file
            $file->move($restaurantDir, $newFilename);

            // Save to database
            $menu = new Menu();
            $menu->setName($name);
            $menu->setType($type);
            $menu->setFilePath('menus/' . $restaurant->getId() . '/' . $newFilename);
            $menu->setRestaurant($restaurant);

            $this->entityManager->persist($menu);
            $this->entityManager->flush();

            $this->logger->info('Menu created', [
                'menu_id' => $menu->getId(),
                'restaurant_id' => $restaurant->getId(),
                'type' => $type
            ]);

            return $this->json([
                'success' => true,
                'message' => 'Menu créé avec succès',
                'menu' => [
                    'id' => $menu->getId(),
                    'name' => $menu->getName(),
                    'type' => $menu->getType(),
                ]
            ]);
        } catch (FileException $e) {
            $this->logger->error('File upload failed', [
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload du fichier'
            ], 500);
        } catch (\Exception $e) {
            $this->logger->error('Menu creation failed', [
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la création du menu'
            ], 500);
        }
    }

    #[Route('/list', name: 'menu_list', methods: ['GET'])]
    public function list(): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $restaurant = $user->getRestaurant();
        if (!$restaurant) {
            return $this->json(['success' => false, 'message' => 'Restaurant non trouvé'], 404);
        }

        $menus = $this->entityManager
            ->getRepository(Menu::class)
            ->findBy(['restaurant' => $restaurant], ['createdAt' => 'DESC']);

        $menuData = array_map(function (Menu $menu) {
            return [
                'id' => $menu->getId(),
                'name' => $menu->getName(),
                'type' => $menu->getType(),
                'filePath' => $menu->getFilePath(),
                'createdAt' => $menu->getCreatedAt()->format('Y-m-d H:i:s'),
                'displayOrder' => $menu->getDisplayOrder(),
            ];
        }, $menus);

        return $this->json([
            'success' => true,
            'menus' => $menuData
        ]);
    }

    #[Route('/update/{id}', name: 'menu_update', methods: ['POST'])]
    public function update(string $id, Request $request): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $restaurant = $user->getRestaurant();
        if (!$restaurant) {
            return $this->json(['success' => false, 'message' => 'Restaurant non trouvé'], 404);
        }

        $menu = $this->entityManager
            ->getRepository(Menu::class)
            ->findOneBy(['id' => $id, 'restaurant' => $restaurant]);

        if (!$menu) {
            return $this->json(['success' => false, 'message' => 'Menu non trouvé'], 404);
        }

        $name = $request->request->get('name');
        $file = $request->files->get('file');

        if (!$name) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom est requis'
            ], 400);
        }

        try {
            $menu->setName($name);

            if ($file) {
                $type = $menu->getType();

                if ($type === 'pdf' && $file->getMimeType() !== 'application/pdf') {
                    return $this->json([
                        'success' => false,
                        'message' => 'Le fichier doit être un PDF'
                    ], 400);
                }

                if ($type === 'image' && !str_starts_with($file->getMimeType(), 'image/')) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Le fichier doit être une image'
                    ], 400);
                }

                $oldFilePath = $this->uploadsDirectory . '/' . $menu->getFilePath();
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }

                $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $this->slugger->slug($originalFilename);
                $extension = $file->guessExtension();
                $newFilename = $safeFilename . '-' . uniqid() . '.' . $extension;

                $restaurantDir = $this->uploadsDirectory . '/menus/' . $restaurant->getId();
                if (!is_dir($restaurantDir)) {
                    mkdir($restaurantDir, 0755, true);
                }

                $file->move($restaurantDir, $newFilename);
                $menu->setFilePath('menus/' . $restaurant->getId() . '/' . $newFilename);
            }

            $this->entityManager->flush();

            $this->logger->info('Menu updated', [
                'menu_id' => $menu->getId(),
                'restaurant_id' => $restaurant->getId(),
            ]);

            return $this->json([
                'success' => true,
                'message' => 'Menu modifié avec succès',
            ]);
        } catch (FileException $e) {
            $this->logger->error('File upload failed', [
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload du fichier'
            ], 500);
        } catch (\Exception $e) {
            $this->logger->error('Menu update failed', [
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la modification du menu'
            ], 500);
        }
    }

    #[Route('/reorder', name: 'menu_reorder', methods: ['POST'])]
    public function reorder(Request $request): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $restaurant = $user->getRestaurant();
        if (!$restaurant) {
            return $this->json(['success' => false, 'message' => 'Restaurant non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $menus = $data['menus'] ?? [];

        if (empty($menus)) {
            return $this->json([
                'success' => false,
                'message' => 'Aucun menu fourni'
            ], 400);
        }

        try {
            foreach ($menus as $menuData) {
                $menu = $this->entityManager
                    ->getRepository(Menu::class)
                    ->findOneBy(['id' => $menuData['id'], 'restaurant' => $restaurant]);

                if ($menu) {
                    $menu->setDisplayOrder($menuData['displayOrder']);
                }
            }

            $this->entityManager->flush();

            $this->logger->info('Menu order updated', [
                'restaurant_id' => $restaurant->getId(),
                'count' => count($menus),
            ]);

            return $this->json([
                'success' => true,
                'message' => 'Ordre des menus mis à jour',
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Menu reorder failed', [
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la réorganisation des menus'
            ], 500);
        }
    }
}
