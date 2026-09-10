<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/orders/index', ['orders' => Order::query()->withCount('items')->latest()->paginate(20)]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $currentTeam, Order $order): Response
    {
        return Inertia::render('admin/orders/show', ['order' => $order->load('items')]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Team $currentTeam, Order $order): RedirectResponse
    {
        $order->update($request->validated());

        return back()->with('success', 'Pedido actualizado.');
    }
}
