<?php

namespace App\Services\Billing;

use App\Models\CompanySetting;
use App\Models\ElectronicDocument;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptPdf
{
    public function render(ElectronicDocument $document, string $format = 'a4'): string
    {
        $format = $format === 'ticket' ? 'ticket' : 'a4';
        $document->loadMissing(['order', 'serviceRequest.user', 'softwareMembership.user']);
        $settings = CompanySetting::query()->firstOrNew([], ['company_name' => 'JBTECHLINE']);
        $logo = public_path('images/brand/jbtechline-logo-v2.png');

        $pdf = Pdf::loadView('admin.electronic-billing.pdf', [
            'document' => $document,
            'settings' => $settings,
            'format' => $format,
            'logoData' => is_file($logo) ? 'data:image/png;base64,'.base64_encode((string) file_get_contents($logo)) : null,
        ])->setWarnings(false);

        if ($format === 'ticket') {
            $pdf->setPaper([0, 0, 226.77, 841.89]);
        } else {
            $pdf->setPaper('a4');
        }

        return $pdf->output();
    }
}
