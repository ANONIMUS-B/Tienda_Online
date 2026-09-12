<?php

namespace App\Http\Controllers;

use App\Models\MediaFile;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class MediaFileController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(string $mediaFile): Response
    {
        $media = Cache::remember('media.'.$mediaFile, now()->addDay(), fn (): array => MediaFile::query()->findOrFail($mediaFile)->toArray());

        return response(base64_decode($media['contents'], true) ?: '', 200, [
            'Content-Type' => $media['mime_type'],
            'Content-Length' => (string) $media['size'],
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
