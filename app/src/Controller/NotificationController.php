<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class NotificationController extends AbstractController
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    #[Route('/notifications', name: 'notifications', methods: ['GET'])]
    public function index(): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('auth_login');
        }

        // Get all notifications for the user
        $notifications = $this->notificationRepository->findByUser($user);

        // Mark all as read
        foreach ($notifications as $notification) {
            if (!$notification->isRead()) {
                $notification->setIsRead(true);
                $notification->setReadAt(new \DateTimeImmutable());
            }
        }
        $this->entityManager->flush();

        // Serialize notifications for React
        $notificationsData = array_map(function (Notification $notification) {
            return [
                'id' => $notification->getId()->toRfc4122(),
                'title' => $notification->getTitle(),
                'message' => $notification->getMessage(),
                'isRead' => $notification->isRead(),
                'createdAt' => $notification->getCreatedAt()->format('c'),
                'metadata' => $notification->getMetadata(),
            ];
        }, $notifications);

        return $this->render('notification/index.html.twig', [
            'notifications' => json_encode($notificationsData),
        ]);
    }

    #[Route('/notifications/count', name: 'notifications_count', methods: ['GET'])]
    public function count(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['count' => 0]);
        }

        $count = $this->notificationRepository->countUnreadForUser($user);

        return new JsonResponse(['count' => $count]);
    }
}
