import { Link, usePage } from '@inertiajs/react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { index as cart } from '@/routes/cart';
import {
    about,
    apps,
    blog,
    brands,
    categories,
    contact,
    dashboard,
    home,
    login,
    products,
    register,
    search,
    services,
    software,
} from '@/routes';

const navigation = [
    ['Inicio', home],
    ['Productos', products],
    ['Categorías', categories],
    ['Servicios', services],
    ['Software', software],
    ['Apps', apps],
    ['Marcas', brands],
    ['Nosotros', about],
    ['Blog', blog],
    ['Contacto', contact],
] as const;

export default function PublicHeader() {
    const { auth, currentTeam, cartCount = 0 } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#050806]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 lg:px-8">
                <Link href={home()} className="flex items-center gap-3">
                    <img
                        src="/images/brand/jbtechline-logo.png"
                        alt="JBTECHLINE"
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
                    {navigation.map(([label, route]) => (
                        <Link
                            key={label}
                            href={route()}
                            className="text-xs font-medium text-white/65 transition hover:text-lime-400"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="hidden items-center gap-2 lg:flex">
                    <Link
                        href={search()}
                        className="rounded-full p-2.5 text-white/70"
                    >
                        <Search className="size-5" />
                    </Link>
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
                        <Link
                            href={dashboardUrl}
                            className="ml-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-black"
                        >
                            Mi panel
                        </Link>
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
                <nav className="flex flex-col border-t border-white/8 bg-[#08100b] px-5 py-5 lg:hidden">
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
                </nav>
            )}
        </header>
    );
}
