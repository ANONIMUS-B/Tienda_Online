import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Menu, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
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
                <Link href={home()} prefetch className="flex items-center gap-3">
                    <img
                        src="/images/brand/jbtechline-logo.png"
                        alt="JBTECHLINE"
                        loading="eager"
                        draggable={false}
                        className="h-16 w-20 object-contain"
                    />
                    <div className="hidden sm:block">
                        <p className="text-lg leading-none font-black">
                            JB<span className="text-lime-400">TECHLINE</span>
                        </p>
                        <p className="mt-1 text-[9px] tracking-[.2em] text-white/45 uppercase">
                            Tu aliado tecnológico
                        </p>
                    </div>
                </Link>
                <nav className="hidden items-center gap-4 xl:flex">
                    <Link
                        href={home()}
                        prefetch
                        className={`text-xs font-medium transition hover:text-lime-400 ${currentPath === '/' ? 'text-lime-400' : 'text-white/65'}`}
                    >
                        Inicio
                    </Link>
                    <div className="group relative">
                        <Link
                            href={products()}
                            prefetch
                            className={`flex items-center gap-1 py-3 text-xs font-medium transition hover:text-lime-400 ${currentPath.startsWith('/productos') || currentPath.startsWith('/categorias') || currentPath.startsWith('/marcas') ? 'text-lime-400' : 'text-white/65'}`}
                        >
                            Productos <ChevronDown className="size-3" />
                        </Link>
                        <div className="invisible absolute top-full left-0 z-50 w-44 translate-y-1 rounded-xl border border-white/10 bg-[#13201c] p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                            <Link
                                href={products()}
                                className="block rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/8 hover:text-lime-400"
                            >
                                Ver productos
                            </Link>
                            <Link
                                href={categories()}
                                className="block rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/8 hover:text-lime-400"
                            >
                                Categorías
                            </Link>
                            <Link
                                href={brands()}
                                className="block rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/8 hover:text-lime-400"
                            >
                                Marcas
                            </Link>
                        </div>
                    </div>
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
                    <Link
                        href={cart()}
                        className="relative rounded-full p-2.5 text-white/70"
                    >
                        <ShoppingCart className="size-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-lime-400 text-[10px] font-black text-black">
                                {cartCount}
                            </span>
                        )}
                    </Link>
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
                    <div className="ml-4 border-l border-white/10 pl-2">
                        <Link
                            href={categories()}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-4 py-2 text-sm text-white/60"
                        >
                            Categorías
                        </Link>
                        <Link
                            href={brands()}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-4 py-2 text-sm text-white/60"
                        >
                            Marcas
                        </Link>
                    </div>
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
                    <Link
                        href={cart()}
                        className="mt-3 rounded-xl bg-lime-400 px-4 py-3 text-center font-bold text-black"
                    >
                        Carrito ({cartCount})
                    </Link>
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
