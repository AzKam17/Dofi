<?php

namespace App\Controller;

use App\Entity\QRCodeScan;
use App\Repository\QRCodeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class QRCodeScanController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private QRCodeRepository $qrCodeRepository
    ) {
    }

    #[Route('/q/{code}', name: 'qr_code_scan')]
    public function scan(string $code, Request $request): Response
    {
        $qrCode = $this->qrCodeRepository->findOneBy(['code' => $code]);

        if (!$qrCode) {
            throw $this->createNotFoundException('QR Code not found');
        }

        $scan = new QRCodeScan();
        $scan->setQrCode($qrCode);

        $metadata = [
            'user_agent' => $request->headers->get('User-Agent'),
            'ip_address' => $request->getClientIp(),
            'referer' => $request->headers->get('referer'),
        ];
        $scan->setMetadata($metadata);

        $this->entityManager->persist($scan);
        $this->entityManager->flush();

        $restaurant = $qrCode->getRestaurant();

        if (!$restaurant) {
            return $this->render('public/qr_no_restaurant.html.twig', [
                'code' => $code,
            ]);
        }

        return $this->redirectToRoute('public_restaurant', [
            'slug' => $restaurant->getSlug(),
        ]);
    }
}
