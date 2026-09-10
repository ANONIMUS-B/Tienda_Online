<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\HomepageSettingController;
use App\Http\Controllers\CategoryCatalogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', HomepageController::class)->name('home');
Route::inertia('/productos', 'public-section', ['section' => 'products'])->name('products');
Route::get('/categorias', CategoryCatalogController::class)->name('categories');
Route::inertia('/servicios', 'public-section', ['section' => 'services'])->name('services');
Route::inertia('/software', 'public-section', ['section' => 'software'])->name('software');
Route::inertia('/nosotros', 'public-section', ['section' => 'about'])->name('about');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::middleware(EnsureTeamMembership::class.':admin')->group(function () {
            Route::get('administracion/inicio', [HomepageSettingController::class, 'edit'])->name('admin.homepage.edit');
            Route::put('administracion/inicio', [HomepageSettingController::class, 'update'])->name('admin.homepage.update');
            Route::resource('administracion/categorias', CategoryController::class)
                ->parameters(['categorias' => 'category'])
                ->except('show')
                ->names('admin.categories');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
