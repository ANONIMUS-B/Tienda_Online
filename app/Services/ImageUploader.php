<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploader
{
    public function replace(?UploadedFile $image, string $directory, ?string $currentPath = null): ?string
    {
        if (! $image) {
            return $currentPath;
        }

        $this->delete($currentPath);
        $path = $image->store($directory, 'public');

        return $path ? '/storage/'.$path : $currentPath;
    }

    public function delete(?string $path): void
    {
        if ($path && Str::startsWith($path, '/storage/')) {
            Storage::disk('public')->delete(Str::after($path, '/storage/'));
        }
    }
}
