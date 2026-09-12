<?php

namespace App\Http\Middleware;

use App\Services\ShoppingCart;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /** @var array{currentTeam: array<string, mixed>|null, teams: array<int, array<string, mixed>>}|null */
    private ?array $teamNavigation = null;

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cartCount' => fn () => array_sum(app(ShoppingCart::class)->quantities()),
            'flash' => [
                'toast' => fn () => $request->session()->has('success')
                    ? ['type' => 'success', 'message' => $request->session()->get('success')]
                    : null,
            ],
        ];
    }

    /**
     * Keep stable sidebar data in the browser between Inertia navigations.
     *
     * @return array<string, mixed>
     */
    public function shareOnce(Request $request): array
    {
        $user = $request->user();

        if ($user === null) {
            return [
                'currentTeam' => fn () => null,
                'teams' => fn () => [],
            ];
        }

        $version = implode(':', [
            $user->id,
            $user->current_team_id ?? 'none',
            $user->updated_at?->getTimestamp() ?? 0,
        ]);

        return [
            'currentTeam' => Inertia::once(fn () => $this->resolveTeamNavigation($request)['currentTeam'])
                ->as("current-team:{$version}")
                ->until(60),
            'teams' => Inertia::once(fn () => $this->resolveTeamNavigation($request)['teams'])
                ->as("teams:{$version}")
                ->until(60),
        ];
    }

    /** @return array{currentTeam: array<string, mixed>|null, teams: array<int, array<string, mixed>>} */
    private function resolveTeamNavigation(Request $request): array
    {
        if ($this->teamNavigation !== null) {
            return $this->teamNavigation;
        }

        $user = $request->user();
        $teams = $user?->teams()
            ->get(['teams.id', 'teams.name', 'teams.slug', 'teams.is_personal'])
            ->map(fn ($team) => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'isPersonal' => $team->is_personal,
                'role' => $team->pivot->role,
                'roleLabel' => match ($team->pivot->role) {
                    'owner' => 'Propietario',
                    'admin' => 'Administrador',
                    'customer' => 'Cliente',
                    default => 'Miembro',
                },
                'isCurrent' => $team->id === $user->current_team_id,
            ])
            ->values()
            ->all() ?? [];

        return $this->teamNavigation = [
            'currentTeam' => collect($teams)->firstWhere('isCurrent', true),
            'teams' => $teams,
        ];
    }
}
