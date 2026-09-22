<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateIdentityLookupRequest;
use App\Models\CompanySetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class IdentityLookupController extends Controller
{
    public function update(UpdateIdentityLookupRequest $request): RedirectResponse
    {
        $settings = CompanySetting::query()->firstOrCreate([], ['company_name' => 'JBTECHLINE']);
        $data = $request->safe()->except('forget_token');
        if ($request->boolean('forget_token')) {
            $data['identity_lookup_token'] = null;
        } elseif (blank($data['identity_lookup_token'] ?? null)) {
            unset($data['identity_lookup_token']);
        }
        $settings->update($data);

        return back()->with('success', 'Configuración de consultas DNI/RUC guardada.');
    }

    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'document_type' => ['required', 'in:dni,ruc'],
            'document_number' => ['required', $request->input('document_type') === 'ruc' ? 'digits:11' : 'digits:8'],
        ]);
        $settings = CompanySetting::query()->first();
        if (! $settings?->identity_lookup_enabled || blank($settings->identity_lookup_token) || $settings->identity_lookup_provider !== 'decolecta') {
            throw ValidationException::withMessages(['document_number' => 'La consulta no está configurada. Puedes ingresar los datos manualmente.']);
        }

        $path = $data['document_type'] === 'ruc' ? 'sunat/ruc' : 'reniec/dni';
        try {
            $response = Http::acceptJson()->withToken($settings->identity_lookup_token)
                ->connectTimeout(3)->timeout(10)->withoutRedirecting()
                ->get('https://api.decolecta.com/v1/'.$path, ['numero' => $data['document_number']]);
        } catch (ConnectionException) {
            throw ValidationException::withMessages(['document_number' => 'El proveedor no responde. Puedes ingresar los datos manualmente.']);
        }
        $body = $response->json();
        $name = is_array($body) ? ($body[$data['document_type'] === 'ruc' ? 'razon_social' : 'full_name'] ?? null) : null;
        $number = is_array($body) ? ($body[$data['document_type'] === 'ruc' ? 'numero_documento' : 'document_number'] ?? null) : null;
        if (! $response->successful() || ! is_string($name) || blank($name) || $number !== $data['document_number']) {
            throw ValidationException::withMessages(['document_number' => 'No se pudo verificar el documento. Revisa el número o completa los datos manualmente.']);
        }

        return response()->json([
            'customer_name' => $name,
            'document_number' => $number,
            'address' => is_string($body['direccion'] ?? null) ? $body['direccion'] : '',
            'status' => is_string($body['estado'] ?? null) ? $body['estado'] : null,
            'condition' => is_string($body['condicion'] ?? null) ? $body['condicion'] : null,
        ])->header('Cache-Control', 'no-store');
    }
}
