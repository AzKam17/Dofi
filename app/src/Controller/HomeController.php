<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->redirectToRoute('auth_login');
        }

        if (!$user->hasCompletedOnboarding()) {
            return $this->redirectToRoute('onboarding_index');
        }

        return $this->render('home/index.html.twig', [
            'user' => $user,
        ]);
    }

    #[Route('/menu', name: 'app_menu')]
    public function menu(): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->redirectToRoute('auth_login');
        }

        if (!$user->hasCompletedOnboarding()) {
            return $this->redirectToRoute('onboarding_index');
        }

        return $this->render('menu/index.html.twig', [
            'user' => $user,
        ]);
    }
}
