<?php

namespace App\Models;

use Database\Factories\HomepageSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'hero_overline',
    'hero_title',
    'hero_accent',
    'hero_description',
    'hero_primary_label',
    'hero_primary_url',
    'hero_secondary_label',
    'hero_secondary_url',
    'hero_image_path',
])]
class HomepageSetting extends Model
{
    /** @use HasFactory<HomepageSettingFactory> */
    use HasFactory;

    /** @return array<string, string> */
    public static function defaults(): array
    {
        return [
            'hero_overline' => 'Soluciones que impulsan tu futuro',
            'hero_title' => 'Next-gen',
            'hero_accent' => 'Technology',
            'hero_description' => 'Impulsamos personas y negocios con tecnología de próxima generación.',
            'hero_primary_label' => 'Explorar productos',
            'hero_primary_url' => '/productos',
            'hero_secondary_label' => 'Descubrir soluciones',
            'hero_secondary_url' => '/servicios',
            'hero_image_path' => '/images/brand/jbtechline-hero-3d.png',
        ];
    }

    /** @return array<string, string> */
    public static function content(): array
    {
        $setting = static::query()->first();

        return array_merge(static::defaults(), $setting?->only(array_keys(static::defaults())) ?? []);
    }
}
