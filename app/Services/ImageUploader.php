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
        MediaFile::query()->create(['id' => $id, 'mime_type' => $image->getMimeType() ?: 'application/octet-stream', 'size' => $image->getSize(), 'original_name' => $image->getClientOriginalName(), 'contents' => base64_encode($contents)]);

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
