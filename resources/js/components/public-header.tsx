import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Menu, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { openCartDrawer } from '@/components/cart-drawer';
import SearchPopover from '@/components/search-popover';
import { index as cart } from '@/routes/cart';
import { index as programs } from '@/routes/programs';
import {
    apps,
    brands,
    categories,
    contact,
    dashboard,
    home,
    login,
    logout,
    products,
    register,
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

export default function PublicHeader() {
    const page = usePage();
    const { auth, currentTeam, cartCount = 0 } = page.props as any;
    const [open, setOpen] = useState(false);
    const currentPath = page.url.split('?')[0];
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const isCustomer = auth.user?.role === 'user';
    const accountUrl = isCustomer ? cart() : dashboardUrl;
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-300/10 bg-[#0d1714]/95 shadow-lg shadow-black/10 backdrop-blur-xl">
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
                <div className="hidden items-center gap-2 lg:flex">
                    <SearchPopover showLabel />
                    <button
                        type="button"
                        onClick={openCartDrawer}
                        className="relative rounded-full p-2.5 text-white/70 hover:text-lime-400 transition"
                    >
                        <ShoppingCart className="size-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-lime-400 text-[10px] font-black text-black shadow-md shadow-lime-400/50">
                                {cartCount}
                            </span>
                        )}
                    </button>
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
                            <Link
                                href={login()}
                                className="px-3 py-2 text-sm font-semibold text-white/75"
                            >
                                Ingresar
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-black"
                            >
                                Crear cuenta
                            </Link>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="rounded-xl border border-white/10 p-2.5 lg:hidden"
                >
                    {open ? (
                        <X className="size-5" />
                    ) : (
                        <Menu className="size-5" />
                    )}
                </button>
            </div>
            {open && (
                <nav className="flex flex-col border-t border-white/8 bg-[#13201c] px-5 py-5 lg:hidden">
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
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            openCartDrawer();
                        }}
                        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 font-bold text-black shadow-lg shadow-lime-400/20"
                    >
                        <ShoppingCart className="size-5" /> Carrito ({cartCount})
                    </button>
                    {auth.user && (
                        <>
                            {!isCustomer && (
                                <Link href={dashboardUrl} className="mt-2 rounded-xl border border-lime-400/40 px-4 py-3 text-center font-bold text-lime-400">
                                    Mi panel
                                </Link>
                            )}
                            <Link href={logout()} method="post" as="button" className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-red-300/30 px-4 py-3 text-red-300">
                                <LogOut className="size-4" /> Cerrar sesión
                            </Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}
