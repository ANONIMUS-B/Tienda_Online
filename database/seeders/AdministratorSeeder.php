<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Enums\SystemRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdministratorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ([
            ['name' => 'Administrador 1', 'email' => 'ayalaromerojordanbrandon@gmail.com', 'password' => 'jbtechline@2026'],
            ['name' => 'Administrador 2', 'email' => 'johannr992@gmail.com', 'password' => 'johan123'],
        ] as $administrator) {
            $user = User::query()->updateOrCreate(
                ['email' => $administrator['email']],
                [
                    'name' => $administrator['name'],
                    'password' => Hash::make($administrator['password']),
                    'role' => SystemRole::Admin,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ],
            );

            if (! $user->currentTeam) {
                app(CreateTeam::class)->handle($user, $user->name."'s Team", isPersonal: true);
            }
        }
    }
}
