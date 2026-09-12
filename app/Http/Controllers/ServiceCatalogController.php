<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Inertia\Inertia;
use Inertia\Response;

class ServiceCatalogController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $settings = CompanySetting::query()->first();
        $number = preg_replace('/\D/', '', (string) ($settings?->whatsapp_number ?: config('services.whatsapp.number')));
        $message = 'Hola, deseo solicitar una evaluación para el mantenimiento o reparación de mi equipo. Quisiera conocer la disponibilidad y los pasos para el diagnóstico.';

        return Inertia::render('public-section', [
            'section' => 'services',
            'whatsappUrl' => filled($number)
                ? 'https://wa.me/'.$number.'?text='.rawurlencode($message)
                : null,
        ]);
    }
}
