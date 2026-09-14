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

test('administrators can upload programs into shared storage', function () {
    $user = User::factory()->create();
    $payload = ['name' => 'POS JBTECHLINE', 'slug' => 'pos-jbtechline', 'category' => 'Facturación', 'platform' => 'Windows', 'version' => '1.0', 'license_type' => 'demo', 'price' => null, 'short_description' => 'Sistema de ventas', 'description' => 'Control comercial', 'requirements' => 'Windows 10', 'is_own' => true, 'is_featured' => true, 'is_active' => true, 'program_file' => UploadedFile::fake()->create('pos.zip', 20, 'application/zip')];

    $this->actingAs($user)->post(route('admin.software.store', $user->currentTeam), $payload)->assertRedirect();

    $program = SoftwareProgram::query()->firstOrFail();
    expect($program->file_id)->not->toBeNull();
    $this->assertDatabaseHas('media_files', ['id' => $program->file_id]);
});
