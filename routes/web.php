<?php

use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CompanySettingController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\ElectronicBillingController;
use App\Http\Controllers\Admin\HomepageSettingController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ServiceRequestController as AdminServiceRequestController;
use App\Http\Controllers\Admin\SoftwareMembershipController as AdminSoftwareMembershipController;
use App\Http\Controllers\Admin\SoftwareProgramController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\BrandCatalogController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryCatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\MediaFileController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\ProgramCatalogController;
use App\Http\Controllers\ProgramDownloadController;
use App\Http\Controllers\ServiceCatalogController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Controllers\SoftwareCatalogController;
use App\Http\Controllers\SoftwareMembershipController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', HomepageController::class)->name('home');
Route::get('/media/{mediaFile}', MediaFileController::class)->name('media.show');
Route::get('/productos', [ProductCatalogController::class, 'index'])->name('products');
Route::get('/productos/{product}', [ProductCatalogController::class, 'show'])->name('products.show');
Route::get('/categorias', CategoryCatalogController::class)->name('categories');
Route::get('/servicios', ServiceCatalogController::class)->name('services');
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
Route::get('/buscar', GlobalSearchController::class)->name('search');
Route::get('/carrito', [CartController::class, 'index'])->name('cart.index');
Route::get('/carrito/whatsapp', [CartController::class, 'whatsapp'])->middleware('auth')->name('cart.whatsapp');
Route::post('/carrito', [CartController::class, 'store'])->name('cart.store');
Route::patch('/carrito/{product}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrito/{product}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::middleware('auth')->group(function () {
    Route::post('/membresia-software', [SoftwareMembershipController::class, 'store'])->name('software-memberships.store');
    Route::get('/mis-solicitudes', [ServiceRequestController::class, 'index'])->name('service-requests.index');
    Route::post('/solicitudes-servicio', [ServiceRequestController::class, 'store'])->name('service-requests.store');
    Route::get('/finalizar-compra', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('/finalizar-compra', [CheckoutController::class, 'store'])->name('checkout.store');
});
Route::get('/pedido/{number}', [CustomerOrderController::class, 'show'])->middleware('signed')->name('orders.show');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->middleware('system.role:admin,subadmin')->name('dashboard');

        Route::middleware(['system.role:admin,subadmin', EnsureTeamMembership::class.':admin'])->group(function () {
            Route::get('administracion/inicio', [HomepageSettingController::class, 'edit'])->name('admin.homepage.edit');
            Route::put('administracion/inicio', [HomepageSettingController::class, 'update'])->name('admin.homepage.update');
            Route::get('administracion/empresa', [CompanySettingController::class, 'edit'])->name('admin.company-settings.edit');
            Route::put('administracion/empresa', [CompanySettingController::class, 'update'])->name('admin.company-settings.update');
            Route::get('administracion/facturacion', [ElectronicBillingController::class, 'edit'])->name('admin.electronic-billing.edit');
            Route::put('administracion/facturacion', [ElectronicBillingController::class, 'update'])->name('admin.electronic-billing.update');
            Route::get('administracion/facturacion/{electronicDocument}/json', [ElectronicBillingController::class, 'json'])->name('admin.electronic-billing.json');
            Route::get('administracion/facturacion/{electronicDocument}/pdf', [ElectronicBillingController::class, 'pdf'])->name('admin.electronic-billing.pdf');
            Route::get('administracion/facturacion/{electronicDocument}/html', [ElectronicBillingController::class, 'html'])->name('admin.electronic-billing.html');
            Route::get('administracion/facturacion/{electronicDocument}/xml', [ElectronicBillingController::class, 'xml'])->name('admin.electronic-billing.xml');
            Route::get('administracion/facturacion/{electronicDocument}/cdr', [ElectronicBillingController::class, 'cdr'])->name('admin.electronic-billing.cdr');
            Route::resource('administracion/categorias', CategoryController::class)
                ->parameters(['categorias' => 'category'])
                ->except('show')
                ->names('admin.categories');
            Route::resource('administracion/marcas', BrandController::class)
                ->parameters(['marcas' => 'brand'])
                ->except('show')
                ->names('admin.brands');
            Route::delete('administracion/productos/{product}/imagenes/{image}', [ProductController::class, 'destroyImage'])->name('admin.products.images.destroy');
            Route::resource('administracion/productos', ProductController::class)
                ->parameters(['productos' => 'product'])
                ->except('show')
                ->names('admin.products');
            Route::resource('administracion/pedidos', OrderController::class)
                ->parameters(['pedidos' => 'order'])
                ->only(['index', 'show', 'update'])
                ->names('admin.orders');
            Route::post('administracion/pedidos/{order}/emitir-comprobante', [OrderController::class, 'issue'])->name('admin.orders.issue');
            Route::post('administracion/pedidos/{order}/compartir-comprobante', [OrderController::class, 'share'])->name('admin.orders.share');
            Route::resource('administracion/software', SoftwareProgramController::class)
                ->parameters(['software' => 'software_program'])
                ->except('show')
                ->names('admin.software');
            Route::get('administracion/membresias-software', [AdminSoftwareMembershipController::class, 'index'])->name('admin.software-memberships.index');
            Route::put('administracion/membresias-software/{softwareMembership}', [AdminSoftwareMembershipController::class, 'update'])->name('admin.software-memberships.update');
            Route::post('administracion/membresias-software/{softwareMembership}/emitir-comprobante', [AdminSoftwareMembershipController::class, 'issue'])->name('admin.software-memberships.issue');
            Route::get('administracion/clientes', [CustomerController::class, 'index'])->name('admin.customers.index');
            Route::get('administracion/clientes/{customer}', [CustomerController::class, 'show'])->name('admin.customers.show');
            Route::get('administracion/solicitudes-servicio', [AdminServiceRequestController::class, 'index'])->name('admin.service-requests.index');
            Route::put('administracion/solicitudes-servicio/{serviceRequest}', [AdminServiceRequestController::class, 'update'])->name('admin.service-requests.update');
            Route::post('administracion/solicitudes-servicio/{serviceRequest}/emitir-comprobante', [AdminServiceRequestController::class, 'issue'])->name('admin.service-requests.issue');
            Route::get('administracion/usuarios', [UserController::class, 'index'])->name('admin.users.index');

            Route::middleware('system.role:admin')->group(function () {
                Route::get('administracion/usuarios/crear', [UserController::class, 'create'])->name('admin.users.create');
                Route::post('administracion/usuarios', [UserController::class, 'store'])->name('admin.users.store');
                Route::get('administracion/usuarios/{user}/editar', [UserController::class, 'edit'])->name('admin.users.edit');
                Route::put('administracion/usuarios/{user}', [UserController::class, 'update'])->name('admin.users.update');
                Route::delete('administracion/usuarios/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
            });
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
