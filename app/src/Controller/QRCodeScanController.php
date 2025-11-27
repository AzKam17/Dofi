<?php

namespace App\Controller;

use App\Entity\QRCodeScan;
use App\Repository\QRCodeRepository;
use App\Repository\QRCodeScanRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class QRCodeScanController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private QRCodeRepository $qrCodeRepository,
        private QRCodeScanRepository $qrCodeScanRepository
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

        // Get fingerprint from query parameter or cookie
        $fingerprint = $request->query->get('fp') ?? $request->cookies->get('user_fp');
        if ($fingerprint && preg_match('/^[a-f0-9]{64}$/i', $fingerprint)) {
            $scan->setFingerprint($fingerprint);
        }

        $metadata = [
            'user_agent' => $request->headers->get('User-Agent'),
            'ip_address' => $request->getClientIp(),
            'referer' => $request->headers->get('referer'),
        ];
        $scan->setMetadata($metadata);

        $qrCode->incrementScans();

        $this->entityManager->persist($scan);
        $this->entityManager->persist($qrCode);
        $this->entityManager->flush();

        $restaurant = $qrCode->getRestaurant();

        if (!$restaurant) {
            return $this->render('public/qr_no_restaurant.html.twig', [
                'code' => $code,
                'qr_code' => $qrCode,
            ]);
        }

        return $this->redirectToRoute('public_restaurant', [
            'slug' => $restaurant->getSlug(),
            'qr' => $code,
        ]);
    }

    #[Route('/api/scan/update-fingerprint', name: 'api_scan_update_fingerprint', methods: ['POST'])]
    public function updateFingerprint(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['qr_code']) || !isset($data['fingerprint'])) {
            return new JsonResponse(['success' => false, 'error' => 'Missing parameters'], 400);
        }

        $qrCode = $this->qrCodeRepository->findOneBy(['code' => $data['qr_code']]);

        if (!$qrCode) {
            return new JsonResponse(['success' => false, 'error' => 'QR Code not found'], 404);
        }

        $fingerprint = $data['fingerprint'];

        // Validate fingerprint format (SHA-256 hex)
        if (!preg_match('/^[a-f0-9]{64}$/i', $fingerprint)) {
            return new JsonResponse(['success' => false, 'error' => 'Invalid fingerprint format'], 400);
        }

        // Find the most recent scan for this QR code without a fingerprint
        $scan = $this->qrCodeScanRepository->createQueryBuilder('s')
            ->where('s.qrCode = :qrCode')
            ->andWhere('s.fingerprint IS NULL')
            ->setParameter('qrCode', $qrCode)
            ->orderBy('s.scannedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($scan) {
            $scan->setFingerprint($fingerprint);
            $this->entityManager->flush();

            return new JsonResponse(['success' => true]);
        }

        return new JsonResponse(['success' => false, 'error' => 'No recent scan found'], 404);
    }
}
