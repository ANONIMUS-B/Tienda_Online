<?php

namespace App\Http\Middleware;

use App\Enums\SystemRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSystemRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowedRoles = collect($roles)->map(fn (string $role) => SystemRole::tryFrom($role))->filter();

        if ($user?->role === SystemRole::User && $request->isMethod('GET')) {
            return redirect()->route('cart.index');
        }

        abort_if(! $user || ! $user->is_active || ! $allowedRoles->contains($user->role), 403);

        return $next($request);
    }
}
