import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    ChevronDown,
    ChevronRight,
    LogOut,
    Menu,
    Package,
    ShoppingCart,
    X,
} from 'lucide-react';
import { useState } from 'react';
import AuthModal, { type AuthModalMode } from '@/components/auth-modal';
import { openCartDrawer } from '@/components/cart-drawer';
import SearchPopover from '@/components/search-popover';
import { index as cart } from '@/routes/cart';
import { index as programs } from '@/routes/programs';
import {
    apps,
    categories,
    contact,
    dashboard,
    home,
    logout,
    products,
    services,
    software,
} from '@/routes';

const navigation = [
    ['Servicios', services],
    ['Software', software],
    ['Programas', programs],
    ['Apps', apps],
    ['Contacto', contact],
] as const;

type CatalogCategory = {
    id: number;
    name: string;
    slug: string;
    image_path: string | null;
    children: Array<{ id: number; name: string; slug: string }>;
};

export default function PublicHeader() {
    const page = usePage();
    const {
        auth,
        currentTeam,
        cartCount = 0,
        catalogCategories = [],
        serviceNotifications = { unread: 0, latest: [] },
        accountNotifications = { unread: 0, latest: [] },
        membershipNotice = null,
    } = page.props as any;
    const [open, setOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [authModal, setAuthModal] = useState<AuthModalMode | null>(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const currentPath = page.url.split('?')[0];
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const isCustomer = auth.user?.role === 'user';
    const accountUrl = isCustomer ? cart() : dashboardUrl;
    const notificationCount = serviceNotifications.unread + accountNotifications.unread + (membershipNotice ? 1 : 0);
    return (
        <>
            <header className="border-brand-primary/25 bg-brand-background/95 fixed inset-x-0 top-0 z-50 border-b shadow-lg shadow-black/10 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 lg:px-8">
                    <Link href={home()} prefetch className="flex items-center">
                        <img
                            src="/images/brand/jbtechline-logo.png"
                            alt="JBTECHLINE - Tu aliado tecnológico"
                            loading="eager"
                            draggable={false}
                            className="h-12 w-auto max-w-[240px] object-contain sm:h-14 lg:h-16"
                        />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                        aria-expanded={categoriesOpen}
                        aria-controls="categories-mega-menu"
                        className={`hidden items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition xl:flex ${categoriesOpen ? 'border-lime-400 bg-lime-400 text-black' : 'border-lime-400/25 bg-lime-400/8 text-lime-300 hover:border-lime-400/60'}`}
                    >
                        {categoriesOpen ? (
                            <X className="size-4" />
                        ) : (
                            <Menu className="size-4" />
                        )}
                        Categorías
                        <ChevronDown
                            className={`size-3.5 transition ${categoriesOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <nav className="hidden items-center gap-4 xl:flex">
                        <Link
                            href={home()}
                            prefetch
                            className={`text-xs font-medium transition hover:text-lime-400 ${currentPath === '/' ? 'text-lime-400' : 'text-white/65'}`}
                        >
                            Inicio
                        </Link>
                        <Link
                            href={products()}
                            prefetch
                            className={`text-xs font-medium transition hover:text-lime-400 ${currentPath.startsWith('/productos') ? 'text-lime-400' : 'text-white/65'}`}
                        >
                            Productos
                        </Link>
                        {navigation.map(([label, route]) => (
                            <Link
                                key={label}
                                href={route()}
                                prefetch
                                className={`text-xs font-medium transition hover:text-lime-400 ${currentPath === route().url ? 'text-lime-400' : 'text-white/65'}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden items-center gap-2 xl:flex">
                        <SearchPopover showLabel />
                        {isCustomer && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setNotificationsOpen(!notificationsOpen)
                                    }
                                    aria-label={`Notificaciones: ${notificationCount}`}
                                    className="relative rounded-full p-2.5 text-white/70 transition hover:text-lime-400"
                                >
                                    <Bell className="size-5" />
                                    {notificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-lime-400 text-[10px] font-black text-black">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                                {notificationsOpen && (
                                    <div className="absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-cyan-200 bg-white text-slate-700 shadow-2xl">
                                        <div className="border-b border-cyan-100 px-4 py-3">
                                            <p className="font-bold">
                                                Notificaciones
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Seguimiento de tus solicitudes
                                            </p>
                                        </div>
                                        {membershipNotice && (
                                            <Link href={programs()} onClick={() => setNotificationsOpen(false)} className="block border-b border-cyan-50 bg-amber-50 px-4 py-3 transition hover:bg-amber-100">
                                                <p className="text-xs font-bold text-amber-700">Membresía por vencer</p>
                                                <p className="mt-1 text-sm">Vence el {new Date(membershipNotice.expires_at).toLocaleDateString('es-PE')}.</p>
                                            </Link>
                                        )}
                                        {accountNotifications.latest.map((notification: any) => (
                                            <a key={notification.id} href={notification.data.url} className="block border-b border-cyan-50 bg-cyan-50/50 px-4 py-3 transition hover:bg-cyan-50">
                                                <p className="text-xs font-bold text-cyan-600">{notification.data.title}</p>
                                                <p className="mt-1 text-sm">{notification.data.message}</p>
                                            </a>
                                        ))}
                                        {serviceNotifications.latest.length === 0 && accountNotifications.latest.length === 0 && !membershipNotice ? (
                                            <p className="px-4 py-6 text-center text-sm text-slate-500">
                                                Aún no tienes respuestas.
                                            </p>
                                        ) : (
                                            serviceNotifications.latest.map(
                                                (notification: any) => (
                                                    <Link
                                                        key={notification.id}
                                                        href="/mis-solicitudes"
                                                        onClick={() =>
                                                            setNotificationsOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="block border-b border-cyan-50 px-4 py-3 transition hover:bg-cyan-50"
                                                    >
                                                        <p className="text-xs font-bold text-cyan-600">
                                                            {
                                                                notification.number
                                                            }
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-sm">
                                                            {
                                                                notification.admin_response
                                                            }
                                                        </p>
                                                    </Link>
                                                ),
                                            )
                                        )}
                                        <Link
                                            href="/mis-solicitudes"
                                            onClick={() =>
                                                setNotificationsOpen(false)
                                            }
                                            className="block px-4 py-3 text-center text-sm font-bold text-cyan-600"
                                        >
                                            Ver todas mis solicitudes
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                        {currentPath !== '/carrito' && (
                            <button
                                type="button"
                                onClick={openCartDrawer}
                                aria-label={`Abrir carrito con ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
                                className="relative rounded-full p-2.5 text-white/70 transition hover:text-lime-400"
                            >
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-lime-400 text-[10px] font-black text-black shadow-md shadow-lime-400/50">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}
                        {auth.user ? (
                            <>
                                <Link
                                    href={accountUrl}
                                    className="ml-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-black"
                                >
                                    {isCustomer ? 'Mi carrito' : 'Mi panel'}
                                </Link>
                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 hover:border-red-300/50 hover:text-red-300"
                                >
                                    <LogOut className="size-4" /> Cerrar sesión
                                </Link>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setAuthModal('login')}
                                    className="px-3 py-2 text-sm font-semibold text-white/75"
                                >
                                    Ingresar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthModal('register')}
                                    className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-black"
                                >
                                    Crear cuenta
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="rounded-xl border border-white/10 p-2.5 xl:hidden"
                        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                    >
                        {open ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>
                </div>
                {open && (
                    <nav className="bg-brand-background flex max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto border-t border-white/8 px-4 py-4 xl:hidden">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setCategoriesOpen(true);
                            }}
                            className="mb-2 flex items-center justify-between rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-black"
                        >
                            <span className="flex items-center gap-2">
                                <Menu className="size-4" /> Categorías
                            </span>
                            <ChevronDown
                                className={`size-4 transition ${categoriesOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <Link
                            href={home()}
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm text-white/75"
                        >
                            Inicio
                        </Link>
                        <Link
                            href={products()}
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm text-white/75"
                        >
                            Productos
                        </Link>
                        {navigation.map(([label, route]) => (
                            <Link
                                key={label}
                                href={route()}
                                onClick={() => setOpen(false)}
                                className="rounded-xl px-4 py-3 text-sm text-white/75"
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="mt-3 border-t border-white/8 pt-3">
                            <SearchPopover showLabel />
                        </div>
                        {isCustomer && (
                            <Link
                                href="/mis-solicitudes"
                                onClick={() => setOpen(false)}
                                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-cyan-200 px-4 py-3 font-bold text-cyan-700"
                            >
                                <Bell className="size-5" /> Mis solicitudes
                                {serviceNotifications.unread > 0 && (
                                    <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-xs text-slate-900">
                                        {serviceNotifications.unread}
                                    </span>
                                )}
                            </Link>
                        )}
                        {currentPath !== '/carrito' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    openCartDrawer();
                                }}
                                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 font-bold text-black shadow-lg shadow-lime-400/20"
                            >
                                <ShoppingCart className="size-5" /> Carrito (
                                {cartCount})
                            </button>
                        )}
                        {!auth.user && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setAuthModal('login');
                                    }}
                                    className="rounded-xl border border-cyan-300 px-4 py-3 text-sm font-bold text-cyan-700"
                                >
                                    Ingresar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setAuthModal('register');
                                    }}
                                    className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
                                >
                                    Crear cuenta
                                </button>
                            </div>
                        )}
                        {auth.user && (
                            <>
                                {!isCustomer && (
                                    <Link
                                        href={dashboardUrl}
                                        className="mt-2 rounded-xl border border-lime-400/40 px-4 py-3 text-center font-bold text-lime-400"
                                    >
                                        Mi panel
                                    </Link>
                                )}
                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-red-300/30 px-4 py-3 text-red-300"
                                >
                                    <LogOut className="size-4" /> Cerrar sesión
                                </Link>
                            </>
                        )}
                    </nav>
                )}
            </header>
            {categoriesOpen && (
                <div
                    id="categories-mega-menu"
                    className="fixed inset-x-0 top-20 z-40"
                >
                    <button
                        type="button"
                        aria-label="Cerrar categorías"
                        onClick={() => setCategoriesOpen(false)}
                        className="fixed inset-0 top-20 cursor-default bg-black/55 backdrop-blur-sm"
                    />
                    <div className="border-brand-support/20 bg-brand-background relative mx-auto max-h-[calc(100vh-6rem)] max-w-[1400px] overflow-y-auto border-x border-b shadow-[0_30px_80px_rgba(0,0,0,.65)] xl:rounded-b-3xl">
                        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-7">
                            <div>
                                <p className="text-xs font-extrabold tracking-[.2em] text-lime-400 uppercase">
                                    Catálogo
                                </p>
                                <h2 className="mt-1 text-xl font-black">
                                    Explora nuestras categorías
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCategoriesOpen(false)}
                                className="rounded-full border border-white/10 p-2.5 text-white/55 transition hover:border-lime-400/40 hover:text-lime-400"
                                aria-label="Cerrar menú de categorías"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
                            {(catalogCategories as CatalogCategory[]).map(
                                ({ id, name, slug, image_path, children }) => (
                                    <section
                                        key={id}
                                        className="bg-brand-background p-5 sm:p-6"
                                    >
                                        <Link
                                            href={`${products().url}?category=${slug}`}
                                            onClick={() => {
                                                setCategoriesOpen(false);
                                                setOpen(false);
                                            }}
                                            className="group flex items-center gap-3"
                                        >
                                            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-lime-400/10 text-lime-400 transition group-hover:bg-lime-400 group-hover:text-black">
                                                {image_path ? (
                                                    <img
                                                        src={image_path}
                                                        alt=""
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="size-5" />
                                                )}
                                            </span>
                                            <span className="font-extrabold group-hover:text-lime-400">
                                                {name}
                                            </span>
                                            <ChevronRight className="ml-auto size-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-lime-400" />
                                        </Link>
                                        <div className="mt-5 grid gap-1">
                                            {children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={`${products().url}?category=${child.slug}`}
                                                    onClick={() => {
                                                        setCategoriesOpen(
                                                            false,
                                                        );
                                                        setOpen(false);
                                                    }}
                                                    className="rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                            {children.length === 0 && (
                                                <Link
                                                    href={`${products().url}?category=${slug}`}
                                                    onClick={() => {
                                                        setCategoriesOpen(
                                                            false,
                                                        );
                                                        setOpen(false);
                                                    }}
                                                    className="rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                                                >
                                                    Ver productos
                                                </Link>
                                            )}
                                        </div>
                                    </section>
                                ),
                            )}
                        </div>
                        <div className="flex flex-col justify-between gap-3 border-t border-white/8 bg-black/15 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                            <p className="text-sm text-white/45">
                                Encuentra equipos, componentes y accesorios en
                                un solo lugar.
                            </p>
                            <Link
                                href={categories()}
                                onClick={() => {
                                    setCategoriesOpen(false);
                                    setOpen(false);
                                }}
                                className="inline-flex items-center gap-2 text-sm font-bold text-lime-400"
                            >
                                Ver todas las categorías
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            <AuthModal mode={authModal} onModeChange={setAuthModal} />
        </>
    );
}
