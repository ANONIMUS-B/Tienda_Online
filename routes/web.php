<?php

use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\HomepageSettingController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\BrandCatalogController;
use App\Http\Controllers\CategoryCatalogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', HomepageController::class)->name('home');
Route::get('/productos', [ProductCatalogController::class, 'index'])->name('products');
Route::get('/productos/{product}', [ProductCatalogController::class, 'show'])->name('products.show');
Route::get('/categorias', CategoryCatalogController::class)->name('categories');
Route::inertia('/servicios', 'public-section', ['section' => 'services'])->name('services');
Route::inertia('/software', 'public-section', ['section' => 'software'])->name('software');
Route::inertia('/apps', 'public-section', ['section' => 'apps'])->name('apps');
Route::get('/marcas', BrandCatalogController::class)->name('brands');
Route::inertia('/nosotros', 'public-section', ['section' => 'about'])->name('about');
Route::inertia('/blog', 'public-section', ['section' => 'blog'])->name('blog');
Route::inertia('/contacto', 'public-section', ['section' => 'contact'])->name('contact');
Route::inertia('/buscar', 'public-section', ['section' => 'search'])->name('search');
Route::inertia('/carrito', 'public-section', ['section' => 'cart'])->name('cart');

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
            Route::resource('administracion/marcas', BrandController::class)
                ->parameters(['marcas' => 'brand'])
                ->except('show')
                ->names('admin.brands');
            Route::resource('administracion/productos', ProductController::class)
                ->parameters(['productos' => 'product'])
                ->except('show')
                ->names('admin.products');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
