<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCulqiChargeRequest;
use App\Models\Order;
use App\Services\CulqiGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CulqiPaymentController extends Controller
{
    public function store(StoreCulqiChargeRequest $request, string $number, CulqiGateway $gateway): JsonResponse
    {
        $order = $this->authorizedOrder($request, $number);

        return response()->json(['attempt' => $gateway->charge($order, $request->validated())]);
    }

    public function show(Request $request, string $number, CulqiGateway $gateway): JsonResponse
    {
        $order = $this->authorizedOrder($request, $number);
        $attempt = $order->paymentAttempts()->latest('id')->first();

        return response()->json(['attempt' => $attempt ? ($gateway->reconcile($attempt) ?? $attempt) : null]);
    }

    private function authorizedOrder(Request $request, string $number): Order
    {
        $order = Order::query()->where('number', $number)->firstOrFail();
        abort_unless($request->hasValidSignature() || ($request->user() && $order->user_id === $request->user()->id), 403);
        abort_unless($order->payment_method === 'gateway', 422);

        return $order;
    }

    public function cancel(Request $request, string $number): JsonResponse
    {
        $order = $this->authorizedOrder($request, $number);
        DB::transaction(function () use ($order): void {
            Order::query()->lockForUpdate()->findOrFail($order->id);
            $order->paymentAttempts()->where('status', 'requires_action')->update(['status' => 'failed', 'message' => 'Verificación del banco cancelada antes del cobro.']);
        });

        return response()->json(['attempt' => $order->paymentAttempts()->latest('id')->first()]);
    }
}
