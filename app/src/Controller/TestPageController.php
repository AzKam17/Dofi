<?php

namespace App\Controller;

use App\Service\WhatsAppService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TestPageController extends AbstractController
{
    public function __construct(
        private WhatsAppService $whatsAppService
    ) {}

    #[Route('/test/page', name: 'app_test_page')]
    public function index(): Response
    {
        return $this->render('test_page/index.html.twig', [
            'controller_name' => 'TestPageController',
        ]);
    }

    #[Route('/test/whatsapp/otp', name: 'app_test_whatsapp_otp', methods: ['GET'])]
    public function testWhatsAppOtp(): JsonResponse
    {
        $otpCode = rand(100000, 999999);

        $result = $this->whatsAppService->sendOTPMessage(
            '0779136356',
            (string) $otpCode
        );

        return $this->json([
            'message' => 'WhatsApp OTP test executed',
            'otp_code' => $otpCode,
            'phone_number' => '+2250779136356',
            'result' => $result,
        ]);
    }
}
