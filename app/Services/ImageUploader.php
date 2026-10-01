<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
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
        $id = (string) Str::uuid();
        $contents = file_get_contents($image->getRealPath());
        if ($contents === false) {
            return $currentPath;
        }

        $mimeType = $image->getMimeType() ?: 'application/octet-stream';
        $originalName = $image->getClientOriginalName();

        if (function_exists('imagewebp') && in_array($mimeType, ['image/jpeg', 'image/png'], true)) {
            $gdImage = @imagecreatefromstring($contents);
            if ($gdImage !== false) {
                imagepalettetotruecolor($gdImage);
                imagealphablending($gdImage, true);
                imagesavealpha($gdImage, true);

                ob_start();
                imagewebp($gdImage, null, 85);
                $webpContents = ob_get_clean();
                imagedestroy($gdImage);

                if ($webpContents !== false && strlen($webpContents) > 0) {
                    $contents = $webpContents;
                    $mimeType = 'image/webp';
                    $originalName = pathinfo($originalName, PATHINFO_FILENAME).'.webp';
                }
            }
        }

        MediaFile::query()->create([
            'id' => $id,
            'mime_type' => $mimeType,
            'size' => strlen($contents),
            'original_name' => $originalName,
            'contents' => base64_encode($contents),
        ]);

        return route('media.show', $id, absolute: false);
    }

    public function delete(?string $path): void
    {
        if ($path && Str::startsWith($path, '/storage/')) {
            Storage::disk('public')->delete(Str::after($path, '/storage/'));
        }
        if ($path && Str::startsWith($path, '/media/')) {
            $id = Str::after($path, '/media/');
            MediaFile::query()->whereKey($id)->delete();
            Cache::forget('media.'.$id);
        }
    }
}
