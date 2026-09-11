<?php

use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CompanySettingController;
use App\Http\Controllers\Admin\HomepageSettingController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SoftwareProgramController;
use App\Http\Controllers\BrandCatalogController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryCatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\MediaFileController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\ProgramCatalogController;
use App\Http\Controllers\ProgramDownloadController;
use App\Http\Controllers\SoftwareCatalogController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', HomepageController::class)->name('home');
Route::get('/media/{mediaFile}', MediaFileController::class)->name('media.show');
Route::get('/productos', [ProductCatalogController::class, 'index'])->name('products');
Route::get('/productos/{product}', [ProductCatalogController::class, 'show'])->name('products.show');
Route::get('/categorias', CategoryCatalogController::class)->name('categories');
Route::inertia('/servicios', 'public-section', ['section' => 'services'])->name('services');
Route::get('/software', [SoftwareCatalogController::class, 'index'])->name('software');
Route::get('/software/{softwareProgram}', [SoftwareCatalogController::class, 'show'])->name('software.show');
Route::get('/programas', [ProgramCatalogController::class, 'index'])->name('programs.index');
Route::get('/programas/{softwareProgram}', [ProgramCatalogController::class, 'show'])->name('programs.show');
Route::get('/programas/{softwareProgram}/descargar', ProgramDownloadController::class)->middleware('auth')->name('programs.download');
Route::inertia('/apps', 'public-section', ['section' => 'apps'])->name('apps');
Route::get('/marcas', BrandCatalogController::class)->name('brands');
Route::inertia('/nosotros', 'public-section', ['section' => 'about'])->name('about');
Route::inertia('/blog', 'public-section', ['section' => 'blog'])->name('blog');
Route::inertia('/contacto', 'public-section', ['section' => 'contact'])->name('contact');
Route::inertia('/buscar', 'public-section', ['section' => 'search'])->name('search');
Route::get('/carrito', [CartController::class, 'index'])->name('cart.index');
Route::post('/carrito', [CartController::class, 'store'])->name('cart.store');
Route::patch('/carrito/{product}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrito/{product}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::get('/finalizar-compra', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/finalizar-compra', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/pedido/{number}', [CustomerOrderController::class, 'show'])->middleware('signed')->name('orders.show');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::middleware(EnsureTeamMembership::class.':admin')->group(function () {
            Route::get('administracion/inicio', [HomepageSettingController::class, 'edit'])->name('admin.homepage.edit');
            Route::put('administracion/inicio', [HomepageSettingController::class, 'update'])->name('admin.homepage.update');
            Route::get('administracion/empresa', [CompanySettingController::class, 'edit'])->name('admin.company-settings.edit');
            Route::put('administracion/empresa', [CompanySettingController::class, 'update'])->name('admin.company-settings.update');
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
            Route::resource('administracion/pedidos', OrderController::class)
                ->parameters(['pedidos' => 'order'])
                ->only(['index', 'show', 'update'])
                ->names('admin.orders');
            Route::resource('administracion/software', SoftwareProgramController::class)
                ->parameters(['software' => 'software_program'])
                ->except('show')
                ->names('admin.software');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
