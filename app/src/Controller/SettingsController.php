<?php

namespace App\Controller;

use App\Entity\Restaurant;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

class SettingsController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SluggerInterface $slugger,
        private string $uploadsDirectory
    ) {
    }

    #[Route('/settings', name: 'settings_index')]
    public function index(): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('auth_login');
        }

        $restaurant = $user->getRestaurant();
        if (!$restaurant) {
            return $this->redirectToRoute('onboarding');
        }

        $restaurantData = [
            'name' => $restaurant->getName(),
            'description' => $restaurant->getDescription(),
            'photoPath' => $restaurant->getPhotoPath(),
            'backgroundPhotoPath' => $restaurant->getBackgroundPhotoPath(),
        ];

        return $this->render('settings/index.html.twig', [
            'restaurant' => $restaurantData,
        ]);
    }

    #[Route('/settings/update', name: 'settings_update', methods: ['POST'])]
    public function update(Request $request): Response
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
        $description = $request->request->get('description');

        if (!$name) {
            return $this->json(['success' => false, 'message' => 'Le nom est requis'], 400);
        }

        $restaurant->setName($name);
        $restaurant->setDescription($description);

        // Handle photo upload
        $photoFile = $request->files->get('photo');
        if ($photoFile) {
            $mimeType = $photoFile->getMimeType();
            if (!str_starts_with($mimeType, 'image/')) {
                return $this->json(['success' => false, 'message' => 'Le fichier doit être une image'], 400);
            }

            $originalFilename = pathinfo($photoFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $extension = $photoFile->guessExtension();
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $extension;

            $restaurantDir = $this->uploadsDirectory . '/restaurant/' . $restaurant->getId();
            if (!is_dir($restaurantDir)) {
                mkdir($restaurantDir, 0755, true);
            }

            $photoFile->move($restaurantDir, $newFilename);
            $restaurant->setPhotoPath('restaurant/' . $restaurant->getId() . '/' . $newFilename);
        }

        // Handle background photo upload
        $backgroundFile = $request->files->get('background');
        if ($backgroundFile) {
            $mimeType = $backgroundFile->getMimeType();
            if (!str_starts_with($mimeType, 'image/')) {
                return $this->json(['success' => false, 'message' => 'Le fichier doit être une image'], 400);
            }

            $originalFilename = pathinfo($backgroundFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $extension = $backgroundFile->guessExtension();
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $extension;

            $restaurantDir = $this->uploadsDirectory . '/restaurant/' . $restaurant->getId();
            if (!is_dir($restaurantDir)) {
                mkdir($restaurantDir, 0755, true);
            }

            $backgroundFile->move($restaurantDir, $newFilename);
            $restaurant->setBackgroundPhotoPath('restaurant/' . $restaurant->getId() . '/' . $newFilename);
        }

        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }
}
