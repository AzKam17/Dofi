<?php

namespace App\Repository;

use App\Entity\QRCode;
use App\Entity\QRCodeScan;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<QRCodeScan>
 */
class QRCodeScanRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QRCodeScan::class);
    }

    public function countScansToday(QRCode $qrCode): int
    {
        $today = new \DateTimeImmutable('today');
        $tomorrow = $today->modify('+1 day');

        return $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.qrCode = :qrCode')
            ->andWhere('s.scannedAt >= :today')
            ->andWhere('s.scannedAt < :tomorrow')
            ->setParameter('qrCode', $qrCode)
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countTotalScans(QRCode $qrCode): int
    {
        return $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.qrCode = :qrCode')
            ->setParameter('qrCode', $qrCode)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
