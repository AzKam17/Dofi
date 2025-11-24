<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

class WhatsAppService
{
    private string $accessToken;
    private string $phoneNumberId;
    private string $businessAccountId;
    private string $version;
    private string $baseUrl;

    public function __construct(
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger,
        string $whatsappAccessToken,
        string $whatsappPhoneNumberId,
        string $whatsappBusinessAccountId,
        string $whatsappVersion = 'v18.0'
    ) {
        $this->accessToken = $whatsappAccessToken;
        $this->phoneNumberId = $whatsappPhoneNumberId;
        $this->businessAccountId = $whatsappBusinessAccountId;
        $this->version = $whatsappVersion;
        $this->baseUrl = "https://graph.facebook.com/{$this->version}/{$this->phoneNumberId}/messages";
    }

    public function sendTemplateMessage(
        string $phoneNumber,
        string $templateName,
        string $languageCode,
        array $components,
        array $options = []
    ): array {
        try {
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $phoneNumber,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => [
                        'code' => $languageCode,
                    ],
                    'components' => $components,
                ],
            ];

            if (isset($options['recipientType'])) {
                $payload['recipient_type'] = $options['recipientType'];
            }

            $response = $this->httpClient->request('POST', $this->baseUrl, [
                'headers' => [
                    'Authorization' => "Bearer {$this->accessToken}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $statusCode = $response->getStatusCode();
            $content = $response->toArray();

            $this->logger->info('WhatsApp message sent successfully', [
                'status_code' => $statusCode,
                'response' => $content,
            ]);

            return [
                'success' => true,
                'data' => $content,
            ];
        } catch (\Exception $e) {
            $this->logger->error('Failed to send WhatsApp message', [
                'error' => $e->getMessage(),
                'phone' => $phoneNumber,
                'template' => $templateName,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function sendOTPMessage(string $phoneNumber, string $otpCode): array
    {
        return $this->sendTemplateMessage(
            "+225{$phoneNumber}",
            'otp_request',
            'fr',
            [
                [
                    'type' => 'body',
                    'parameters' => [
                        [
                            'type' => 'text',
                            'text' => $otpCode,
                        ],
                    ],
                ],
                [
                    'type' => 'button',
                    'sub_type' => 'url',
                    'index' => 0,
                    'parameters' => [
                        [
                            'type' => 'text',
                            'text' => $otpCode,
                        ],
                    ],
                ],
            ],
            ['recipientType' => 'individual']
        );
    }

    public function sendWaitListMessage(string $phoneNumber, string $promoCode): array
    {
        return $this->sendTemplateMessage(
            "+225{$phoneNumber}",
            'waitlist_confirmation',
            'fr',
            [
                [
                    'type' => 'body',
                    'parameters' => [
                        [
                            'type' => 'text',
                            'text' => ',',
                        ],
                        [
                            'type' => 'text',
                            'text' => "https://belou.store/?p={$promoCode}",
                        ],
                    ],
                ],
            ],
            ['recipientType' => 'individual']
        );
    }
}
