<?php

namespace App\Actions\Fortify;

use App\Actions\Teams\CreateTeam;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\SystemRole;
use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(private CreateTeam $createTeam)
    {
        //
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'document_type' => ['required', Rule::in(['dni', 'ruc'])],
            'document_number' => [
                'required',
                'digits_between:8,11',
                Rule::when(($input['document_type'] ?? null) === 'dni', ['digits:8']),
                Rule::when(($input['document_type'] ?? null) === 'ruc', ['digits:11']),
                Rule::unique(User::class),
            ],
            'address' => ['required', 'string', 'max:255'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'document_type' => $input['document_type'],
                'document_number' => $input['document_number'],
                'address' => $input['address'],
                'password' => $input['password'],
                'role' => SystemRole::User,
            ]);

            $this->createTeam->handle(
                $user,
                $user->name."'s Team",
                isPersonal: true,
                role: TeamRole::Customer,
            );

            return $user;
        });
    }
}
