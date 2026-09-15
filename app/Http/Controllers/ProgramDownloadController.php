<?php

namespace App\Http\Controllers;

use App\Models\SoftwareProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class ProgramDownloadController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(SoftwareProgram $softwareProgram): Response|RedirectResponse
    {
        abort_unless($softwareProgram->is_active && ($softwareProgram->download_url || $softwareProgram->file_id), 404);
        $canDownload = ($softwareProgram->license_type === 'free' && $softwareProgram->download_enabled)
            || request()->user()?->hasActiveSoftwareMembership();
        abort_unless($canDownload, 403, 'Necesitas una membresía activa para descargar este programa.');
        $softwareProgram->increment('downloads');

        if ($softwareProgram->download_url) {
            return redirect()->away($softwareProgram->download_url);
        }

        $file = $softwareProgram->file()->firstOrFail();

        return response(base64_decode($file->contents, true) ?: '', 200, ['Content-Type' => 'application/octet-stream', 'Content-Disposition' => 'attachment; filename="'.str_replace('"', '', $file->original_name).'"', 'X-Content-Type-Options' => 'nosniff']);
    }
}
