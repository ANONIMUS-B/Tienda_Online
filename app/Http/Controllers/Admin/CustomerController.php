<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/customers/index', ['customers' => User::query()->withCount('orders')->withSum('orders', 'total')->when($request->string('q')->isNotEmpty(), fn ($query) => $query->where(fn ($search) => $search->where('name', 'like', '%'.$request->string('q').'%')->orWhere('email', 'like', '%'.$request->string('q').'%')))->latest()->paginate(20)->withQueryString(), 'filters' => $request->only('q')]);
    }

    public function show(Team $currentTeam, User $customer): Response
    {
        return Inertia::render('admin/customers/show', ['customer' => $customer, 'orders' => $customer->orders()->withCount('items')->latest()->get()]);
    }
}
