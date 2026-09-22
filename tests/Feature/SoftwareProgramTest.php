<?php

use App\Models\MediaFile;
use App\Models\SoftwareProgram;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('visitors can browse and filter published software', function () {
    SoftwareProgram::factory()->create(['name' => 'Sistema de facturación', 'category' => 'Sistemas empresariales', 'platform' => 'Web']);
    SoftwareProgram::factory()->create(['name' => 'Utilidad Windows', 'category' => 'Utilidades', 'platform' => 'Windows']);

    $this->get(route('programs.index', ['category' => 'Sistemas empresariales']))->assertInertia(fn ($page) => $page->component('software/index')->where('catalogType', 'programs')->has('programs.data', 1)->where('programs.data.0.name', 'Sistema de facturación'));
});

test('program downloads require a registered customer', function () {
    $file = MediaFile::query()->create(['id' => (string) str()->uuid(), 'mime_type' => 'application/zip', 'size' => 4, 'original_name' => 'programa.zip', 'contents' => base64_encode('demo')]);
    $program = SoftwareProgram::factory()->create(['file_id' => $file->id, 'download_enabled' => true]);

    $this->get(route('programs.download', $program))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get(route('programs.download', $program))->assertOk()->assertDownload('programa.zip');
    expect($program->fresh()->downloads)->toBe(1);
});

test('administrators can publish programs with an icon and download link', function () {
    $user = User::factory()->create();
    $payload = ['name' => 'POS JBTECHLINE', 'slug' => 'pos-jbtechline', 'category' => 'Facturación', 'platform' => 'Windows', 'version' => '1.0', 'license_type' => 'paid', 'short_description' => 'Sistema de ventas', 'description' => 'Control comercial', 'requirements' => 'Windows 10', 'download_url' => 'https://downloads.example.com/pos.zip', 'download_enabled' => true, 'is_own' => false, 'is_featured' => true, 'is_active' => true, 'image' => UploadedFile::fake()->image('pos.png')];

    $this->actingAs($user)->post(route('admin.software.store', $user->currentTeam), $payload)->assertRedirect();

    $program = SoftwareProgram::query()->firstOrFail();
    expect($program->download_url)->toBe('https://downloads.example.com/pos.zip')
        ->and($program->image_id)->not->toBeNull()
        ->and($program->is_own)->toBeFalse();
});

test('software and programs use separate administration lists', function () {
    $admin = User::factory()->create();
    SoftwareProgram::factory()->create(['name' => 'Programa descargable', 'is_own' => false]);

    $this->actingAs($admin)->get(route('admin.software.index', ['current_team' => $admin->currentTeam, 'catalog' => 'software']))
        ->assertInertia(fn ($page) => $page->component('admin/service-requests/index')->where('quoteMode', true)->has('requests.data', 0));

    $this->actingAs($admin)->get(route('admin.software.index', ['current_team' => $admin->currentTeam, 'catalog' => 'programs']))
        ->assertInertia(fn ($page) => $page->where('catalogType', 'programs')->has('programs.data', 1)->where('programs.data.0.name', 'Programa descargable'));
});

test('authorized customers are redirected to an external program download', function () {
    $program = SoftwareProgram::factory()->create(['download_url' => 'https://downloads.example.com/app.exe', 'download_enabled' => true, 'license_type' => 'free']);

    $this->actingAs(User::factory()->create())->get(route('programs.download', $program))
        ->assertRedirect('https://downloads.example.com/app.exe');
});

test('the apps page displays only applications developed by the company', function () {
    SoftwareProgram::factory()->create(['name' => 'App JB Ventas', 'is_own' => true]);
    SoftwareProgram::factory()->create(['name' => 'Programa de terceros', 'is_own' => false]);

    $this->get(route('apps'))->assertInertia(fn ($page) => $page
        ->component('software/index')
        ->where('catalogType', 'apps')
        ->has('programs.data', 1)
        ->where('programs.data.0.name', 'App JB Ventas'));
});

test('administrators can publish a company application from the apps catalog', function () {
    $admin = User::factory()->create();
    $payload = [
        'name' => 'JB Control', 'slug' => 'jb-control', 'category' => 'Empresarial',
        'platform' => 'Android', 'version' => '1.0', 'license_type' => 'free',
        'short_description' => 'Aplicación desarrollada por JBTECHLINE',
        'download_url' => 'https://apps.example.com/jb-control.apk',
        'download_enabled' => true, 'is_own' => true, 'is_featured' => true, 'is_active' => true,
    ];

    $this->actingAs($admin)
        ->post(route('admin.software.store', $admin->currentTeam), $payload)
        ->assertRedirect(route('admin.software.index', ['current_team' => $admin->currentTeam, 'catalog' => 'apps']));

    expect(SoftwareProgram::query()->sole()->is_own)->toBeTrue();
});
