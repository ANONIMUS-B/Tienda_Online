<?php

namespace App\Http\Controllers;

use App\Models\SoftwareProgram;
use Illuminate\Http\Response;

class ProgramDownloadController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(SoftwareProgram $softwareProgram): Response
    {
        abort_unless($softwareProgram->is_active && ! $softwareProgram->is_own && $softwareProgram->file_id, 404);
        $file = $softwareProgram->file()->firstOrFail();
        $softwareProgram->increment('downloads');

        return response(base64_decode($file->contents, true) ?: '', 200, ['Content-Type' => 'application/octet-stream', 'Content-Disposition' => 'attachment; filename="'.str_replace('"', '', $file->original_name).'"', 'X-Content-Type-Options' => 'nosniff']);
    }
}
