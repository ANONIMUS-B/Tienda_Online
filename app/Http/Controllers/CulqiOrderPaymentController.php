<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCulqiOrderRequest;
use App\Models\Order;
use App\Services\CulqiOrderGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CulqiOrderPaymentController extends Controller
{
    public function store(StoreCulqiOrderRequest $request, string $number, CulqiOrderGateway $gateway): JsonResponse
    {
        return response()->json(['attempt' => $gateway->create($this->authorizedOrder($request, $number))]);
    }

    public function show(Request $request, string $number, CulqiOrderGateway $gateway): JsonResponse
    {
        $order = $this->authorizedOrder($request, $number);
        $attempt = $order->paymentAttempts()->where('payment_type', 'pagoefectivo')->latest('id')->first();

        return response()->json(['attempt' => $attempt ? $gateway->reconcile($attempt) : null]);
    }

    private function authorizedOrder(Request $request, string $number): Order
    {
        $order = Order::query()->where('number', $number)->firstOrFail();
        abort_unless($request->hasValidSignature() || ($request->user() && $order->user_id === $request->user()->id), 403);
        abort_unless($order->payment_method === 'pagoefectivo', 422);

        return $order;
    }
}
