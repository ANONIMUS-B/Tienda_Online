<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Teams\CreateTeam;
use App\Enums\SystemRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->when($request->string('q')->isNotEmpty(), fn ($query) => $query->where(fn ($search) => $search
                    ->where('name', 'like', '%'.$request->string('q').'%')
                    ->orWhere('email', 'like', '%'.$request->string('q').'%')))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only('q'),
            'roles' => $this->roles(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', ['roles' => $this->roles()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request, CreateTeam $createTeam): RedirectResponse
    {
        DB::transaction(function () use ($request, $createTeam): void {
            $user = User::query()->create($request->safe()->except(['password_confirmation']));
            $createTeam->handle($user, $user->name."'s Team", isPersonal: true);
        });

        return redirect()->route('admin.users.index', $request->route('current_team'))->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function edit(Team $currentTeam, User $user): Response
    {
        return Inertia::render('admin/users/edit', ['managedUser' => $user, 'roles' => $this->roles()]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, Team $currentTeam, User $user): RedirectResponse
    {
        $data = $request->safe()->except(['password_confirmation']);
        if (! filled($data['password'] ?? null)) {
            $data = Arr::except($data, 'password');
        }
        $user->update($data);

        return redirect()->route('admin.users.index', $currentTeam)->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Team $currentTeam, User $user): RedirectResponse
    {
        abort_if($request->user()?->is($user), 422, 'No puedes eliminar tu propia cuenta.');
        abort_if($user->isAdmin() && User::query()->where('role', SystemRole::Admin)->count() <= 1, 422, 'Debe permanecer al menos un administrador.');

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    /** @return array<int, array{value: string, label: string}> */
    private function roles(): array
    {
        return collect(SystemRole::cases())->map(fn (SystemRole $role) => [
            'value' => $role->value,
            'label' => $role->label(),
        ])->all();
    }
}
