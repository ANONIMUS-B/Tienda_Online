<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    public function show(string $number): Response
    {
        $order = Order::query()->with('items')->where('number', $number)->firstOrFail();

        return Inertia::render('orders/show', ['order' => $order]);
    }
}
