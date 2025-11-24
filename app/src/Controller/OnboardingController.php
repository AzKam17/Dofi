<?php

namespace App\Controller;

use App\Entity\Restaurant;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/onboarding')]
class OnboardingController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
    ) {}

    #[Route('', name: 'onboarding_index')]
    public function index(): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->redirectToRoute('auth_login');
        }

        if ($user->hasCompletedOnboarding()) {
            return $this->redirectToRoute('app_home');
        }

        $currentStep = 1;
        if ($user->getFirstName() && $user->getFirstName() !== 'User') {
            $currentStep = 2;
        }

        return $this->render('onboarding/index.html.twig', [
            'current_step' => $currentStep,
            'user' => $user,
        ]);
    }

    #[Route('/step-1', name: 'onboarding_step_1', methods: ['POST'])]
    public function stepOne(Request $request): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $firstName = $data['first_name'] ?? null;

        if (!$firstName) {
            return $this->json([
                'success' => false,
                'message' => 'Le prénom est requis'
            ], 400);
        }

        $user->setFirstName($firstName);
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->logger->info('User completed step 1', ['user_id' => $user->getId()]);

        return $this->json([
            'success' => true,
            'message' => 'Prénom enregistré',
            'next_step' => 2
        ]);
    }

    #[Route('/step-2', name: 'onboarding_step_2', methods: ['POST'])]
    public function stepTwo(Request $request): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $restaurantName = $data['restaurant_name'] ?? null;

        if (!$restaurantName) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom du restaurant est requis'
            ], 400);
        }

        $restaurant = new Restaurant();
        $restaurant->setName($restaurantName);

        $user->setRestaurant($restaurant);
        $user->setIsVerified(true);

        $this->entityManager->persist($restaurant);
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->logger->info('User completed onboarding', [
            'user_id' => $user->getId(),
            'restaurant_id' => $restaurant->getId()
        ]);

        return $this->json([
            'success' => true,
            'message' => 'Inscription terminée',
            'redirect' => $this->generateUrl('app_home')
        ]);
    }
}
