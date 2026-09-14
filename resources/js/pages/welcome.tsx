import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    Check,
    CircuitBoard,
    Code2,
    Headphones,
    Laptop,
    LogOut,
    Menu,
    MessageCircle,
    PackageCheck,
    ShieldCheck,
    ShoppingCart,
    Smartphone,
    Star,
    Store,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import type { HeroContent } from '@/types/homepage';
import SearchPopover from '@/components/search-popover';

import {
    apps,
    contact,
    dashboard,
    home,
    login,
    logout,
    products as productsPage,
    register,
    services as servicesPage,
    software as softwarePage,
} from '@/routes';
import { index as cart } from '@/routes/cart';
import { index as programs } from '@/routes/programs';
import { store as addToCart } from '@/routes/cart';
import { show as productShow } from '@/routes/products';
import type { Product } from '@/types/product';

const navigation = [
    { label: 'Servicios', route: servicesPage },
    { label: 'Software', route: softwarePage },
    { label: 'Programas', route: programs },
    { label: 'Apps', route: apps },
    { label: 'Contacto', route: contact },
];

const services = [
    {
        title: 'Soporte técnico',
        text: 'Diagnóstico y solución profesional para tus equipos.',
        icon: Headphones,
    },
    {
        title: 'Mantenimiento',
        text: 'Prevención, limpieza y optimización de PC, laptops e impresoras.',
        icon: Wrench,
    },
    {
        title: 'Software empresarial',
        text: 'Ventas, inventarios, POS y soluciones para cada negocio.',
        icon: Code2,
    },
    {
        title: 'Desarrollo de apps',
        text: 'Aplicaciones web y móviles creadas para tus objetivos.',
        icon: Smartphone,
    },
];

const benefits = [
    {
        title: 'Tecnología',
        text: 'Soluciones actuales y eficientes.',
        icon: Zap,
    },
    {
        title: 'Soporte',
        text: 'Acompañamiento técnico cercano.',
        icon: ShieldCheck,
    },
    {
        title: 'Soluciones empresariales',
        text: 'Tecnología adaptada a cada negocio.',
        icon: Store,
    },
    {
        title: 'Aliado estratégico',
        text: 'Te ayudamos a elegir la solución adecuada.',
        icon: PackageCheck,
    },
];

export default function Welcome({
    hero,
    featuredProducts,
    heroProduct,
}: {
    hero: HeroContent;
    featuredProducts: Product[];
    heroProduct: Product | null;
}) {
    const { auth, currentTeam } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const isCustomer = auth.user?.role === 'user';
    const accountUrl = isCustomer ? cart() : dashboardUrl;

    return (
        <>
            <Head title="Tecnología, soporte y soluciones para tu negocio">
                <meta
                    name="description"
                    content="JBTECHLINE: productos tecnológicos, software, soporte técnico y soluciones empresariales."
                />
            </Head>
            <div className="bg-brand-background selection:bg-brand-primary selection:text-brand-background min-h-screen overflow-hidden text-white">
                <header className="hidden">
                    <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 lg:px-8">
                        <a
                            href="#inicio"
                            className="flex items-center gap-3"
                            aria-label="JBTECHLINE - Inicio"
                        >
                            <img
                                src="/images/brand/jbtechline-logo.png"
                                alt="JBTECHLINE"
                                className="h-16 w-20 object-contain"
                            />
                            <div className="hidden sm:block">
                                <p className="text-lg leading-none font-black tracking-tight">
                                    JB
                                    <span className="text-lime-400">
                                        TECHLINE
                                    </span>
                                </p>
                                <p className="mt-1 text-[9px] tracking-[.2em] text-white/45 uppercase">
                                    Tu aliado tecnológico
                                </p>
                            </div>
                        </a>
                        <nav
                            className="hidden items-center gap-4 xl:flex"
                            aria-label="Navegación principal"
                        >
                            <Link
                                href={home()}
                                className="text-xs font-medium text-white/65 transition hover:text-lime-400"
                            >
                                Inicio
                            </Link>
                            <Link
                                href={productsPage()}
                                className="text-xs font-medium text-white/65 transition hover:text-lime-400"
                            >
                                Productos
                            </Link>
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.route()}
                                    className="text-xs font-medium text-white/65 transition hover:text-lime-400"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="hidden items-center gap-2 lg:flex">
                            <SearchPopover showLabel />
                            <Link
                                href={cart()}
                                className="relative rounded-full p-2.5 text-white/70 hover:bg-white/8 hover:text-lime-400"
                                aria-label="Carrito"
                            >
                                <ShoppingCart className="size-5" />
                                <span className="absolute top-1 right-1 size-2 rounded-full bg-lime-400" />
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
                                        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 hover:text-red-300"
                                    >
                                        <LogOut className="size-4" /> Cerrar
                                        sesión
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
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="rounded-xl border border-white/10 p-2.5 lg:hidden"
                            aria-label="Abrir menú"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                    {menuOpen && (
                        <div className="bg-brand-background border-t border-white/8 px-5 py-5 lg:hidden">
                            <nav className="flex flex-col gap-1">
                                <Link
                                    href={home()}
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/5"
                                >
                                    Inicio
                                </Link>
                                <Link
                                    href={productsPage()}
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/5"
                                >
                                    Productos
                                </Link>
                                {navigation.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.route()}
                                        onClick={() => setMenuOpen(false)}
                                        className="rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/8 pt-4">
                                    <SearchPopover showLabel />
                                    <Link
                                        href={cart()}
                                        className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm"
                                    >
                                        Carrito
                                    </Link>
                                </div>
                                <div className="mt-3 flex gap-3 border-t border-white/8 pt-4">
                                    <Link
                                        href={auth.user ? accountUrl : login()}
                                        className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold"
                                    >
                                        {auth.user
                                            ? isCustomer
                                                ? 'Mi carrito'
                                                : 'Mi panel'
                                            : 'Ingresar'}
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={register()}
                                            className="flex-1 rounded-xl bg-lime-400 px-4 py-3 text-center text-sm font-bold text-black"
                                        >
                                            Crear cuenta
                                        </Link>
                                    )}
                                    {auth.user && (
                                        <Link
                                            href={logout()}
                                            method="post"
                                            as="button"
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300/30 px-4 py-3 text-sm font-semibold text-red-300"
                                        >
                                            <LogOut className="size-4" /> Cerrar
                                            sesión
                                        </Link>
                                    )}
                                </div>
                            </nav>
                        </div>
                    )}
                </header>

                <main>
                    <section
                        id="inicio"
                        className="relative overflow-hidden pt-20"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_58%,rgb(0_247_255/.2),transparent_28%),radial-gradient(circle_at_88%_18%,rgb(0_207_232/.13),transparent_22%),linear-gradient(155deg,#FFFFFF_20%,#F5FDFF_55%,#FFFFFF)]" />
                        <div className="via-brand-interactive/8 absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white to-transparent" />
                        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgb(0_229_255/.1)_1px,transparent_1px),linear-gradient(90deg,rgb(0_229_255/.1)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent,black_48%,transparent)] [background-size:64px_64px] opacity-20" />

                        <div className="relative mx-auto min-h-[520px] max-w-7xl px-4 py-5 sm:min-h-[600px] sm:px-5 sm:py-6 lg:min-h-[680px] lg:px-8">
                            {/* Watermark Background Title (Non-overlapping, pointer-events-none) */}
                            <div className="pointer-events-none absolute inset-x-0 top-12 z-0 text-center opacity-10 select-none">
                                <p className="text-[clamp(3.5rem,8vw,7.5rem)] leading-none font-black tracking-widest text-white uppercase drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                    {heroProduct
                                        ? (heroProduct.category?.name ??
                                          'TECNOLOGÍA 3D')
                                        : hero.hero_title}
                                </p>
                                <p className="mt-2 text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-black tracking-widest text-lime-400 uppercase">
                                    {heroProduct
                                        ? (heroProduct.brand?.name ??
                                          'JBTECHLINE')
                                        : hero.hero_accent}
                                </p>
                            </div>

                            {/* Main 3D Floating Showcase */}
                            <div className="relative z-10 mx-auto flex flex-col items-center justify-center pt-8">
                                {/* Neon Radial Glow Pedestal */}
                                <div className="pointer-events-none absolute top-1/2 left-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/20 blur-[100px] sm:size-[460px]" />

                                {/* Floating 3D Image */}
                                <div className="relative z-20 mx-auto w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[480px]">
                                    <img
                                        src={
                                            heroProduct?.images[0]?.path ??
                                            hero.hero_image_path
                                        }
                                        alt={
                                            heroProduct
                                                ? heroProduct.name
                                                : 'Centro tecnológico modular 3D'
                                        }
                                        className="relative mx-auto max-h-[260px] w-full animate-[hero-float_6s_ease-in-out_infinite] object-contain brightness-105 drop-shadow-[0_30px_45px_rgba(0,0,0,0.3)] filter sm:max-h-[320px] lg:max-h-[380px]"
                                    />
                                </div>

                                {/* Clean Glassmorphism Featured Product Card */}
                                {heroProduct && (
                                    <Link
                                        href={productShow(heroProduct.slug)}
                                        className="group border-brand-primary/45 bg-brand-background/90 hover:border-brand-primary hover:bg-brand-background relative z-30 mt-4 flex w-full max-w-[440px] flex-col items-stretch justify-between gap-3 rounded-2xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgb(0_247_255/.3)] sm:mt-6 sm:flex-row sm:items-center"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider text-lime-300 uppercase">
                                                <Zap className="size-3 text-lime-400" />{' '}
                                                Producto Destacado
                                            </span>
                                            <h2 className="mt-1.5 truncate text-sm font-extrabold text-white transition-colors group-hover:text-lime-300">
                                                {heroProduct.name}
                                            </h2>
                                            <p className="truncate text-[11px] text-white/50">
                                                {heroProduct.brand?.name
                                                    ? `Marca: ${heroProduct.brand.name}`
                                                    : heroProduct.category
                                                          ?.name}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <span className="text-base font-black text-lime-300">
                                                S/{' '}
                                                {heroProduct.promotional_price ??
                                                    heroProduct.price}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-3 py-1 text-[10px] font-extrabold text-black transition hover:bg-lime-300">
                                                Ver Producto{' '}
                                                <ArrowRight className="size-3" />
                                            </span>
                                        </div>
                                    </Link>
                                )}
                            </div>

                            {/* Left Side Floating Card: Products Catalog */}
                            <Link
                                href={hero.hero_primary_url}
                                className="group absolute top-1/3 left-6 z-20 hidden w-56 items-center gap-3 rounded-2xl border border-white/14 bg-black/40 p-4 shadow-xl backdrop-blur-xl transition hover:border-lime-400/50 hover:bg-black/60 lg:flex"
                            >
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300 transition-transform group-hover:scale-105">
                                    <Laptop className="size-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
                                        Catálogo Oficial
                                    </p>
                                    <p className="mt-0.5 text-xs font-black text-white uppercase transition-colors group-hover:text-lime-400">
                                        Productos Tech
                                    </p>
                                </div>
                            </Link>

                            {/* Right Side Floating Card: Support & Services */}
                            <Link
                                href={hero.hero_secondary_url}
                                className="group absolute top-1/3 right-6 z-20 hidden w-56 items-center gap-3 rounded-2xl border border-white/14 bg-black/40 p-4 shadow-xl backdrop-blur-xl transition hover:border-lime-400/50 hover:bg-black/60 lg:flex"
                            >
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300 transition-transform group-hover:scale-105">
                                    <CircuitBoard className="size-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
                                        Asesoría 360°
                                    </p>
                                    <p className="mt-0.5 text-xs font-black text-white uppercase transition-colors group-hover:text-lime-400">
                                        Servicios & Tech
                                    </p>
                                </div>
                            </Link>

                            {/* Bottom Rating & Guarantee Badges */}
                            <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1 text-lime-400">
                                        {Array.from({ length: 5 }).map(
                                            (_, index) => (
                                                <Star
                                                    key={index}
                                                    className="size-3.5 fill-current"
                                                />
                                            ),
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold text-white/60">
                                        <span className="font-bold text-white">
                                            4.9/5
                                        </span>{' '}
                                        Valoración de Clientes
                                    </p>
                                </div>

                                <Link
                                    href={hero.hero_primary_url}
                                    className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-6 py-2.5 text-xs font-extrabold tracking-wider text-lime-300 uppercase backdrop-blur transition hover:border-lime-400 hover:bg-lime-400 hover:text-black"
                                >
                                    Explorar Catálogo de Productos{' '}
                                    <ArrowRight className="size-4" />
                                </Link>

                                <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
                                    <ShieldCheck className="size-4 text-lime-400" />
                                    <span>Garantía Oficial JBTECHLINE</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="productos"
                        className="border-brand-support/15 border-y bg-black/15 py-14 sm:py-18"
                    >
                        <div className="mx-auto max-w-7xl px-5 lg:px-8">
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                                <SectionHeading
                                    eyebrow="Selección destacada"
                                    title="Tecnología recomendada para ti"
                                    text="Productos disponibles seleccionados para ti."
                                    align="left"
                                />
                                <Link
                                    href={productsPage()}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-lime-400"
                                >
                                    Consultar catálogo{' '}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {featuredProducts.map((product) => (
                                    <article
                                        key={product.id}
                                        className="group border-brand-support/20 hover:border-brand-primary/70 overflow-hidden rounded-3xl border bg-black/25 transition duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                                    >
                                        <Link
                                            href={productShow(product.slug)}
                                            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white/5 via-lime-400/5 to-transparent p-6"
                                        >
                                            <span className="border-brand-primary/50 bg-brand-background/90 text-brand-primary absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase shadow-md backdrop-blur-md">
                                                {product.is_featured
                                                    ? 'Destacado'
                                                    : product.is_bestseller
                                                      ? 'Popular'
                                                      : 'Disponible'}
                                            </span>
                                            {product.images[0] ? (
                                                <img
                                                    src={product.images[0].path}
                                                    alt={product.name}
                                                    className="max-h-full max-w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <PackageCheck
                                                    className="size-24 text-lime-300/60 transition group-hover:scale-105"
                                                    strokeWidth={1.1}
                                                />
                                            )}
                                        </Link>
                                        <div className="border-t border-white/8 p-5">
                                            <p className="text-[10px] font-bold tracking-widest text-lime-400 uppercase">
                                                {product.brand?.name ??
                                                    product.category?.name}
                                            </p>
                                            <Link
                                                href={productShow(product.slug)}
                                                className="mt-1.5 line-clamp-1 block text-base font-extrabold text-white transition-colors hover:text-lime-300"
                                            >
                                                {product.name}
                                            </Link>
                                            <div className="mt-4 flex items-end justify-between">
                                                <div>
                                                    {product.promotional_price && (
                                                        <p className="text-xs text-white/40 line-through">
                                                            S/ {product.price}
                                                        </p>
                                                    )}
                                                    <p className="text-xl font-black text-lime-300">
                                                        S/{' '}
                                                        {product.promotional_price ??
                                                            product.price}
                                                    </p>
                                                </div>
                                                <Form
                                                    {...addToCart.form()}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="product_id"
                                                        value={product.id}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="quantity"
                                                        value="1"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="flex size-11 items-center justify-center rounded-full bg-lime-400 text-black shadow-[0_0_15px_rgb(0_247_255/.35)] transition hover:scale-105 hover:bg-lime-300 hover:shadow-[0_0_25px_rgb(0_247_255/.55)] active:scale-95"
                                                        aria-label={`Agregar ${product.name} al carrito`}
                                                    >
                                                        <ShoppingCart className="size-4" />
                                                    </button>
                                                </Form>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                                {featuredProducts.length === 0 && (
                                    <p className="col-span-full rounded-3xl border border-white/10 p-10 text-center text-white/50">
                                        Pronto tendremos productos disponibles.
                                        Vuelve a revisar el catálogo.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section
                        id="servicios"
                        className="mx-auto max-w-7xl px-5 py-14 sm:py-18 lg:px-8"
                    >
                        <SectionHeading
                            eyebrow="Más que tecnología"
                            title="Soluciones que trabajan contigo"
                            text="Experiencia técnica y visión de negocio para acompañarte en cada etapa."
                        />
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {services.map(
                                ({ title, text, icon: Icon }, index) => (
                                    <article
                                        key={title}
                                        className="flex gap-5 rounded-3xl border border-white/9 bg-white/[.03] p-7 hover:border-lime-400/30"
                                    >
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300 to-emerald-600 text-black">
                                            <Icon className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-lime-400/60">
                                                0{index + 1}
                                            </p>
                                            <h3 className="mt-1 text-xl font-bold">
                                                {title}
                                            </h3>
                                            <p className="mt-2 leading-6 text-white/45">
                                                {text}
                                            </p>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>

                    <section
                        id="software"
                        className="border-brand-support/15 from-brand-interactive/25 to-brand-background border-y bg-gradient-to-br py-14 sm:py-18"
                    >
                        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-2 lg:px-8">
                            <div className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 p-7 sm:min-h-[400px]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(0_247_255/.14),transparent_55%)]" />
                                <div className="relative grid h-full grid-cols-2 gap-4">
                                    <div className="col-span-2 rounded-3xl border border-lime-400/20 bg-lime-400/8 p-6">
                                        <Bot className="size-8 text-lime-400" />
                                        <p className="mt-14 text-sm text-white/45">
                                            Gestión inteligente
                                        </p>
                                        <p className="mt-1 text-2xl font-black">
                                            Software para crecer
                                        </p>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                                        <Store className="size-7 text-lime-300" />
                                        <p className="mt-10 font-bold">
                                            POS y ventas
                                        </p>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                                        <PackageCheck className="size-7 text-lime-300" />
                                        <p className="mt-10 font-bold">
                                            Inventarios
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-extrabold tracking-[.24em] text-lime-400 uppercase">
                                    Software & aplicaciones
                                </p>
                                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                                    Digitaliza tu negocio con soluciones a tu
                                    medida.
                                </h2>
                                <p className="mt-6 text-lg leading-8 text-white/50">
                                    Sistemas de ventas, inventarios, POS,
                                    licencias y aplicaciones empresariales con
                                    asesoría especializada.
                                </p>
                                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'Sistemas POS',
                                        'Control de inventario',
                                        'Licencias originales',
                                        'Apps personalizadas',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-center gap-3 text-sm text-white/75"
                                        >
                                            <span className="flex size-6 items-center justify-center rounded-full bg-lime-400/12">
                                                <Check className="size-3.5 text-lime-400" />
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="#contacto"
                                    className="mt-9 inline-flex items-center gap-2 rounded-full border border-lime-400/35 px-6 py-3.5 text-sm font-bold text-lime-300"
                                >
                                    Conocer soluciones{' '}
                                    <ArrowRight className="size-4" />
                                </a>
                            </div>
                        </div>
                    </section>

                    <section
                        id="nosotros"
                        className="mx-auto max-w-7xl px-5 py-14 sm:py-18 lg:px-8"
                    >
                        <SectionHeading
                            eyebrow="¿Por qué JBTECHLINE?"
                            title="Tu aliado estratégico en tecnología"
                            text="No solo vendemos productos: conectamos cada desafío con la solución correcta."
                        />
                        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-white/9 bg-white/9 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map(({ title, text, icon: Icon }) => (
                                <div key={title} className="bg-black/25 p-7">
                                    <Icon className="size-7 text-lime-400" />
                                    <h3 className="mt-6 font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-white/42">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="contacto"
                        className="px-5 pb-14 sm:pb-18 lg:px-8"
                    >
                        <div className="border-brand-primary/30 via-brand-background to-brand-interactive/10 relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border bg-gradient-to-r from-white px-7 py-10 sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
                            <div className="absolute -top-36 -right-28 size-96 rounded-full bg-lime-400/12 blur-3xl" />
                            <div className="relative max-w-2xl">
                                <p className="text-xs font-extrabold tracking-[.22em] text-lime-300 uppercase">
                                    Hablemos de tu próximo proyecto
                                </p>
                                <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                                    ¿Listo para encontrar la tecnología ideal?
                                </h2>
                                <p className="mt-4 text-white/55">
                                    Cuéntanos qué necesitas. Nuestro equipo te
                                    ayudará a elegir una solución pensada para
                                    ti.
                                </p>
                            </div>
                            <a
                                href="https://wa.me/"
                                target="_blank"
                                rel="noreferrer"
                                className="relative mt-8 inline-flex shrink-0 items-center gap-3 rounded-full bg-lime-400 px-7 py-4 font-extrabold text-black lg:mt-0"
                            >
                                <MessageCircle className="size-5" /> Contactar
                                por WhatsApp
                            </a>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/8 bg-black/25">
                    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/brand/jbtechline-logo.png"
                                    alt="JBTECHLINE"
                                    className="h-16 w-20 object-contain"
                                />
                                <p className="text-xl font-black">
                                    JB
                                    <span className="text-lime-400">
                                        TECHLINE
                                    </span>
                                </p>
                            </div>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">
                                Tecnología, soporte y soluciones inteligentes
                                para personas y empresas.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-bold">Explora</p>
                            <div className="mt-4 flex flex-col gap-3 text-sm text-white/40">
                                <a href="#productos">Productos</a>
                                <a href="#servicios">Servicios</a>
                                <a href="#software">Software y apps</a>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold">Cuenta</p>
                            <div className="mt-4 flex flex-col gap-3 text-sm text-white/40">
                                <Link href={login()}>Iniciar sesión</Link>
                                <Link href={register()}>Crear cuenta</Link>
                                <a href="#contacto">Contacto</a>
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/8 px-5 py-6 text-xs text-white/30 sm:flex-row sm:justify-between lg:px-8">
                        <p>
                            © {new Date().getFullYear()} JBTECHLINE. Todos los
                            derechos reservados.
                        </p>
                        <p>Tu aliado estratégico en tecnología.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function SectionHeading({
    eyebrow,
    title,
    text,
    align = 'center',
}: {
    eyebrow: string;
    title: string;
    text: string;
    align?: 'left' | 'center';
}) {
    return (
        <div
            className={
                align === 'center'
                    ? 'mx-auto max-w-2xl text-center'
                    : 'max-w-2xl'
            }
        >
            <p className="text-xs font-extrabold tracking-[.24em] text-lime-400 uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {title}
            </h2>
            <p className="mt-3 leading-7 text-white/48">{text}</p>
        </div>
    );
}
