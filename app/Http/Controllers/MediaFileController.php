<?php

namespace App\Http\Controllers;

use App\Models\MediaFile;
use Illuminate\Http\Response;

class MediaFileController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MediaFile $mediaFile): Response
    {
        return response(base64_decode($mediaFile->contents, true) ?: '', 200, [
            'Content-Type' => $mediaFile->mime_type,
            'Content-Length' => (string) $mediaFile->size,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
