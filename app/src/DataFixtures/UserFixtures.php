<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class UserFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $user = new User();
        $user->setPhoneNumber('0779136356');
        $user->setFirstName('Test');
        $user->setLastName('User');

        $manager->persist($user);
        $manager->flush();
    }
}
