<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\OtpService;
use App\Service\WhatsAppService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private OtpService $otpService,
        private WhatsAppService $whatsAppService,
        private Security $security,
        private LoggerInterface $logger,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/login', name: 'auth_login')]
    public function login(Request $request): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        $error = null;
        $phoneNumber = null;

        if ($request->isMethod('POST')) {
            $phoneNumber = $request->request->get('phone_number');
            $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

            if (!$phoneNumber) {
                $error = 'Please enter a valid phone number';
            } else {
                $user = $this->userRepository->findByPhoneNumber($phoneNumber);

                if (!$user) {
                    $user = new User();
                    $user->setPhoneNumber($phoneNumber);
                    $user->setFirstName('User');
                    $user->setLastName($phoneNumber);
                    $user->setIsVerified(false);

                    $this->entityManager->persist($user);
                    $this->entityManager->flush();

                    $this->logger->info('New user created', ['phone_number' => $phoneNumber]);
                }

                $otpCode = $this->otpService->generateOtp($phoneNumber);
                $result = $this->whatsAppService->sendOTPMessage($phoneNumber, $otpCode);

                if ($result['success']) {
                    return $this->redirectToRoute('auth_verify', [
                        'phone' => $phoneNumber,
                    ]);
                } else {
                    $error = 'Failed to send OTP. Please try again.';
                    $this->logger->error('Failed to send OTP', ['result' => $result]);
                }
            }
        }

        return $this->render('auth/login.html.twig', [
            'error' => $error,
            'phone_number' => $phoneNumber,
        ]);
    }

    #[Route('/verify', name: 'auth_verify')]
    public function verify(Request $request): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        $phoneNumber = $request->query->get('phone');
        $error = null;

        if (!$phoneNumber) {
            return $this->redirectToRoute('auth_login');
        }

        if ($request->isMethod('POST')) {
            $otpCode = $request->request->get('otp_code');

            if (!$otpCode) {
                $error = 'Please enter the OTP code';
            } else {
                $user = $this->userRepository->findByPhoneNumber($phoneNumber);

                if (!$user) {
                    return $this->redirectToRoute('auth_login');
                }

                $isValid = $this->otpService->validateOtp($phoneNumber, $otpCode);

                if ($isValid) {
                    if (!$user->isVerified()) {
                        $user->setIsVerified(true);
                        $this->entityManager->persist($user);
                        $this->entityManager->flush();
                        $this->logger->info('User verified', ['phone_number' => $phoneNumber]);
                    }

                    $this->security->login($user);
                    return $this->redirectToRoute('app_home');
                } else {
                    $error = 'Invalid or expired OTP code';
                }
            }
        }

        return $this->render('auth/verify.html.twig', [
            'phone_number' => $phoneNumber,
            'error' => $error,
            'expires_in' => $this->otpService->getOtpExpiryInSeconds(),
        ]);
    }

    #[Route('/logout', name: 'auth_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    #[Route('/home', name: 'app_home')]
    public function home(): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->redirectToRoute('auth_login');
        }

        return $this->render('auth/home.html.twig', [
            'user' => $user,
        ]);
    }
}
