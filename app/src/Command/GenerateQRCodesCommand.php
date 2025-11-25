<?php

namespace App\Command;

use App\Entity\QRCode;
use App\Repository\QRCodeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:generate-qr-codes',
    description: 'Generate QR codes without restaurant association',
)]
class GenerateQRCodesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private QRCodeRepository $qrCodeRepository
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('count', InputArgument::OPTIONAL, 'Number of QR codes to generate', 1000);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $count = $input->getArgument('count');

        $io->title(sprintf('Generating %d QR codes', $count));

        $generated = 0;
        $batchSize = 100;

        for ($i = 0; $i < $count; $i++) {
            $code = $this->generateUniqueCode();

            $qrCode = new QRCode();
            $qrCode->setCode($code);

            $this->entityManager->persist($qrCode);

            $generated++;

            // Flush every batch to avoid memory issues
            if (($i + 1) % $batchSize === 0) {
                $this->entityManager->flush();
                $this->entityManager->clear();
                $io->writeln(sprintf('Generated %d/%d QR codes...', $generated, $count));
            }
        }

        // Flush remaining entities
        $this->entityManager->flush();
        $this->entityManager->clear();

        $io->success(sprintf('Successfully generated %d QR codes!', $generated));

        return Command::SUCCESS;
    }

    private function generateUniqueCode(): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $maxAttempts = 1000;
        $attempt = 0;

        do {
            $code = '';
            for ($i = 0; $i < 5; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }

            $existing = $this->qrCodeRepository->findOneBy(['code' => $code]);
            $attempt++;

            if ($attempt >= $maxAttempts) {
                throw new \RuntimeException('Could not generate unique code after ' . $maxAttempts . ' attempts');
            }
        } while ($existing !== null);

        return $code;
    }
}
