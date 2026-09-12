<?php

namespace App\Enums;

enum SystemRole: string
{
    case Admin = 'admin';
    case Subadmin = 'subadmin';
    case User = 'user';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Subadmin => 'Subadministrador',
            self::User => 'Cliente',
        };
    }

    public function canAccessAdministration(): bool
    {
        return $this === self::Admin || $this === self::Subadmin;
    }
}
