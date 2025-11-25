<?php

namespace App\Controller;

use App\Repository\QRCodeRepository;
use App\Repository\QRCodeScanRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class QRCodesController extends AbstractController
{
    public function __construct(
        private QRCodeRepository $qrCodeRepository,
        private QRCodeScanRepository $qrCodeScanRepository
    ) {
    }

    #[Route('/qr-codes', name: 'qr_codes_index')]
    public function index(): Response
    {
        $restaurant = $this->getUser()->getRestaurant();

        $qrCodes = $this->qrCodeRepository->findBy(['restaurant' => $restaurant]);

        $qrCodesData = [];
        foreach ($qrCodes as $qrCode) {
            $qrCodesData[] = [
                'id' => $qrCode->getId()->toRfc4122(),
                'code' => $qrCode->getCode(),
                'tableName' => $qrCode->getTableName(),
                'scansToday' => $this->qrCodeScanRepository->countScansToday($qrCode),
                'scansTotal' => $this->qrCodeScanRepository->countTotalScans($qrCode),
                'createdAt' => $qrCode->getCreatedAt()->format('c'),
            ];
        }

        return $this->render('qr_codes/index.html.twig', [
            'qrCodes' => $qrCodesData,
        ]);
    }
}
