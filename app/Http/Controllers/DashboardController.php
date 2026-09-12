<?php

namespace App\Http\Controllers;

use App\Enums\SystemRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\SoftwareProgram;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->join('users as inviters', 'inviters.id', '=', 'team_invitations.invited_by')
            ->join('teams', 'teams.id', '=', 'team_invitations.team_id')
            ->whereRaw('LOWER(team_invitations.email) = ?', [$email])
            ->whereNull('team_invitations.accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('team_invitations.expires_at')
                ->orWhere('team_invitations.expires_at', '>=', now()))
            ->latest('team_invitations.created_at')
            ->get([
                'team_invitations.code',
                'inviters.name as inviter_name',
                'teams.name as team_name',
                'teams.slug as team_slug',
            ])
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->getAttribute('inviter_name'),
                'team' => [
                    'name' => $invitation->getAttribute('team_name'),
                    'slug' => $invitation->getAttribute('team_slug'),
                ],
            ]);

        $summary = Cache::remember('admin.dashboard.summary', 30, function (): object {
            return DB::query()
                ->selectSub(Product::query()->selectRaw('COUNT(*)'), 'products')
                ->selectSub(Order::query()->where('status', 'pending')->selectRaw('COUNT(*)'), 'pending_orders')
                ->selectSub(User::query()->where('role', SystemRole::User)->selectRaw('COUNT(*)'), 'customers')
                ->selectSub(SoftwareProgram::query()->where('is_active', true)->selectRaw('COUNT(*)'), 'programs')
                ->firstOrFail();
        });

        $recentOrders = Cache::remember('admin.dashboard.recent-orders', 20, fn () => Order::query()
            ->latest()
            ->limit(5)
            ->get(['id', 'number', 'customer_name', 'status', 'total', 'created_at']));

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'summary' => [
                'products' => (int) $summary->products,
                'pendingOrders' => (int) $summary->pending_orders,
                'customers' => (int) $summary->customers,
                'programs' => (int) $summary->programs,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
