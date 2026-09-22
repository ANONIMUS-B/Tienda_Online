<?php

namespace App\Http\Controllers;

use App\Services\CulqiGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CulqiWebhookController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, CulqiGateway $gateway): JsonResponse
    {
        abort_if(strlen($request->getContent()) > 65536, 413);

        return $gateway->webhook($request->all())
            ? response()->json(['received' => true])
            : response()->json(['received' => false], 503);
    }
}
