<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\Cache\CacheInterface;

class OtpService
{
    private const OTP_EXPIRY = 600;
    private const OTP_PREFIX = 'otp:';

    private array $testPhoneNumbers;

    public function __construct(
        private CacheInterface $cache,
        private LoggerInterface $logger,
        private ParameterBagInterface $params
    ) {
        $testNumbers = $this->params->get('test_phone_numbers') ?? '';
        $this->testPhoneNumbers = array_filter(array_map('trim', explode(',', $testNumbers)));
    }

    public function generateOtp(string $phoneNumber): string
    {
        // Use fixed OTP for test phone numbers
        if ($this->isTestPhoneNumber($phoneNumber)) {
            $otpCode = '000000';
            $this->logger->info('Test OTP generated', [
                'phone_number' => $phoneNumber,
                'otp_code' => $otpCode,
            ]);
        } else {
            $otpCode = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        }

        $key = $this->getOtpKey($phoneNumber);

        $this->cache->delete($key);

        $item = $this->cache->getItem($key);
        $item->set($otpCode);
        $item->expiresAfter(self::OTP_EXPIRY);
        $this->cache->save($item);

        $this->logger->info('OTP generated', [
            'phone_number' => $phoneNumber,
            'expires_in' => self::OTP_EXPIRY,
        ]);

        return $otpCode;
    }

    private function isTestPhoneNumber(string $phoneNumber): bool
    {
        // Extract only digits for comparison
        $cleanNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

        foreach ($this->testPhoneNumbers as $testNumber) {
            $cleanTestNumber = preg_replace('/[^0-9]/', '', $testNumber);
            // Match last 10 digits
            if (strlen($cleanNumber) >= 10 && strlen($cleanTestNumber) === 10) {
                if (substr($cleanNumber, -10) === $cleanTestNumber) {
                    return true;
                }
            }
        }

        return false;
    }

    public function validateOtp(string $phoneNumber, string $code): bool
    {
        $key = $this->getOtpKey($phoneNumber);
        $item = $this->cache->getItem($key);

        if (!$item->isHit()) {
            $this->logger->warning('OTP validation failed - not found or expired', [
                'phone_number' => $phoneNumber,
            ]);
            return false;
        }

        $storedCode = $item->get();

        if ($storedCode !== $code) {
            $this->logger->warning('OTP validation failed - code mismatch', [
                'phone_number' => $phoneNumber,
            ]);
            return false;
        }

        $this->cache->delete($key);

        $this->logger->info('OTP validated successfully', [
            'phone_number' => $phoneNumber,
        ]);

        return true;
    }

    public function invalidateOtp(string $phoneNumber): void
    {
        $key = $this->getOtpKey($phoneNumber);
        $this->cache->delete($key);
    }

    private function getOtpKey(string $phoneNumber): string
    {
        return self::OTP_PREFIX . $phoneNumber;
    }

    public function getOtpExpiryInSeconds(): int
    {
        return self::OTP_EXPIRY;
    }
}
