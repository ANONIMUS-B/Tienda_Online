import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    Check,
    ChevronRight,
    CircuitBoard,
    Code2,
    Cpu,
    Headphones,
    Heart,
    Laptop,
    Menu,
    MessageCircle,
    MonitorSmartphone,
    PackageCheck,
    Printer,
    Search,
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

import {
    about,
    categories as categoriesPage,
    dashboard,
    home,
    login,
    products as productsPage,
    register,
    services as servicesPage,
    software as softwarePage,
} from '@/routes';

const navigation = [
    { label: 'Inicio', route: home },
    { label: 'Productos', route: productsPage },
    { label: 'Categorías', route: categoriesPage },
    { label: 'Servicios', route: servicesPage },
    { label: 'Software', route: softwarePage },
    { label: 'Nosotros', route: about },
];

const categories = [
    {
        name: 'Laptops y PCs',
        text: 'Equipos para trabajo, estudio y alto rendimiento.',
        icon: Laptop,
    },
    {
        name: 'Componentes',
        text: 'Potencia y mejora cada parte de tu equipo.',
        icon: Cpu,
    },
    {
        name: 'Impresión',
        text: 'Impresoras, suministros y soluciones empresariales.',
        icon: Printer,
    },
    {
        name: 'Smartphones',
        text: 'Tecnología móvil y accesorios esenciales.',
        icon: Smartphone,
    },
];

const products = [
    {
        name: 'Laptop empresarial Pro',
        type: 'Laptops',
        price: 'S/ 2,899',
        old: 'S/ 3,299',
        badge: '-12%',
        icon: Laptop,
    },
    {
        name: 'Monitor UltraView 27”',
        type: 'Monitores',
        price: 'S/ 899',
        old: 'S/ 1,099',
        badge: 'Oferta',
        icon: MonitorSmartphone,
    },
    {
        name: 'Kit PC Performance',
        type: 'Componentes',
        price: 'S/ 1,449',
        old: 'S/ 1,649',
        badge: 'Popular',
        icon: Cpu,
    },
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

export default function Welcome({ hero }: { hero: HeroContent }) {
    const { auth, currentTeam } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="Tecnología, soporte y soluciones para tu negocio">
                <meta
                    name="description"
                    content="JBTECHLINE: productos tecnológicos, software, soporte técnico y soluciones empresariales."
                />
            </Head>
            <div className="min-h-screen overflow-hidden bg-[#050806] text-white selection:bg-lime-400 selection:text-black">
                <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#050806]/85 backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
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
                            className="hidden items-center gap-7 lg:flex"
                            aria-label="Navegación principal"
                        >
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.route()}
                                    className="text-sm font-medium text-white/65 transition hover:text-lime-400"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="hidden items-center gap-2 lg:flex">
                            <a
                                href="#productos"
                                className="rounded-full p-2.5 text-white/70 hover:bg-white/8 hover:text-lime-400"
                                aria-label="Buscar"
                            >
                                <Search className="size-5" />
                            </a>
                            <a
                                href="#productos"
                                className="relative rounded-full p-2.5 text-white/70 hover:bg-white/8 hover:text-lime-400"
                                aria-label="Carrito"
                            >
                                <ShoppingCart className="size-5" />
                                <span className="absolute top-1 right-1 size-2 rounded-full bg-lime-400" />
                            </a>
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
                        <div className="border-t border-white/8 bg-[#08100b] px-5 py-5 lg:hidden">
                            <nav className="flex flex-col gap-1">
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
                                <div className="mt-3 flex gap-3 border-t border-white/8 pt-4">
                                    <Link
                                        href={
                                            auth.user ? dashboardUrl : login()
                                        }
                                        className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold"
                                    >
                                        {auth.user ? 'Mi panel' : 'Ingresar'}
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={register()}
                                            className="flex-1 rounded-xl bg-lime-400 px-4 py-3 text-center text-sm font-bold text-black"
                                        >
                                            Crear cuenta
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
                        className="relative min-h-screen overflow-hidden pt-24"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_58%,rgba(66,210,0,.18),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,.08),transparent_22%),linear-gradient(155deg,#080b09_20%,#111511_55%,#061008)]" />
                        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#14440c]/80 via-[#0b2808]/35 to-transparent" />
                        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(132,255,75,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(132,255,75,.08)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent,black_48%,transparent)] [background-size:64px_64px] opacity-20" />

                        <div className="relative mx-auto min-h-[820px] max-w-7xl px-5 py-12 lg:px-8">
                            <p className="text-[clamp(4.2rem,10.5vw,9.2rem)] leading-[.78] font-light tracking-[-.075em] text-white uppercase">
                                {hero.hero_title}
                            </p>
                            <p className="relative z-20 mt-[clamp(16rem,30vw,24rem)] text-right text-[clamp(3.6rem,9.7vw,8.6rem)] leading-[.78] font-light tracking-[-.075em] text-white uppercase lg:mt-44">
                                {hero.hero_accent}
                            </p>

                            <div className="absolute top-[18%] left-1/2 z-10 w-[min(82vw,740px)] -translate-x-1/2 lg:top-[15%]">
                                <div className="absolute inset-[18%] rounded-full bg-lime-400/18 blur-[90px]" />
                                <img
                                    src={hero.hero_image_path}
                                    alt="Centro tecnológico modular 3D"
                                    className="relative w-full animate-[hero-float_6s_ease-in-out_infinite] object-contain drop-shadow-[0_45px_55px_rgba(0,0,0,.65)]"
                                />
                            </div>

                            <div className="absolute top-[47%] left-5 z-20 hidden w-52 overflow-hidden rounded-2xl border border-white/14 bg-black/20 backdrop-blur-xl sm:block lg:left-8">
                                <div className="flex h-32 items-center justify-center border-b border-white/10 bg-gradient-to-br from-lime-400/10 to-transparent">
                                    <Cpu
                                        className="size-20 text-lime-300/90"
                                        strokeWidth={1}
                                    />
                                </div>
                                <div className="flex items-end justify-between p-4">
                                    <div>
                                        <p className="text-[10px] tracking-[.18em] text-white/35 uppercase">
                                            {hero.hero_overline}
                                        </p>
                                        <p className="mt-1 text-sm font-black uppercase">
                                            Tech solutions
                                        </p>
                                    </div>
                                    <a
                                        href={hero.hero_primary_url}
                                        className="flex size-8 items-center justify-center rounded-full bg-lime-400 text-black"
                                        aria-label="Ver productos"
                                    >
                                        <ArrowRight className="size-4" />
                                    </a>
                                </div>
                            </div>

                            <div className="absolute top-[31%] right-5 z-20 hidden items-center gap-4 lg:right-8 lg:flex">
                                <p className="max-w-28 text-right text-[10px] leading-3 font-semibold tracking-wide text-white/55 uppercase">
                                    Donde la tecnología acelera la innovación
                                </p>
                                <div className="flex size-24 items-center justify-center rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl">
                                    <CircuitBoard
                                        className="size-12 text-lime-400"
                                        strokeWidth={1.2}
                                    />
                                </div>
                            </div>

                            <div className="absolute right-5 bottom-12 z-20 max-w-56 lg:right-8">
                                <p className="text-sm leading-5 text-white/58">
                                    {hero.hero_description}
                                </p>
                                <a
                                    href={hero.hero_secondary_url}
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-wider text-lime-400 uppercase"
                                >
                                    {hero.hero_secondary_label}{' '}
                                    <ArrowRight className="size-4" />
                                </a>
                            </div>
                            <div className="absolute bottom-10 left-5 z-20 lg:left-8">
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
                                <div className="mt-2 flex items-end gap-3">
                                    <span className="text-3xl font-light italic">
                                        360°
                                    </span>
                                    <span className="max-w-24 text-[10px] leading-3 font-bold text-white/45 uppercase">
                                        Asesoría tecnológica integral
                                    </span>
                                </div>
                            </div>

                            <a
                                href={hero.hero_primary_url}
                                className="absolute bottom-8 left-1/2 z-20 hidden size-24 -translate-x-1/2 items-center justify-center rounded-full border border-lime-400/25 bg-lime-400/10 text-center text-[10px] font-bold tracking-wider text-lime-300 uppercase backdrop-blur md:flex"
                            >
                                {hero.hero_primary_label}
                            </a>
                        </div>
                    </section>

                    <section className="border-y border-white/8 bg-white/[.025]">
                        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/8 px-5 py-7 md:grid-cols-4 lg:px-8">
                            {[
                                ['+10', 'Categorías tecnológicas'],
                                ['360°', 'Asesoría integral'],
                                ['24/7', 'Catálogo disponible'],
                                ['100%', 'Enfoque en soluciones'],
                            ].map(([value, label]) => (
                                <div
                                    key={label}
                                    className="px-4 py-3 text-center"
                                >
                                    <p className="text-2xl font-black text-lime-400">
                                        {value}
                                    </p>
                                    <p className="mt-1 text-xs text-white/45">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="categorias"
                        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
                    >
                        <SectionHeading
                            eyebrow="Explora por categoría"
                            title="Todo lo que necesitas, en un solo lugar"
                            text="Encuentra equipos y soluciones seleccionadas para cada necesidad tecnológica."
                        />
                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {categories.map(({ name, text, icon: Icon }) => (
                                <a
                                    href="#productos"
                                    key={name}
                                    className="group rounded-3xl border border-white/9 bg-white/[.035] p-7 transition hover:-translate-y-1 hover:border-lime-400/35"
                                >
                                    <div className="mb-8 flex size-13 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
                                        <Icon className="size-6" />
                                    </div>
                                    <h3 className="text-lg font-bold">
                                        {name}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-white/45">
                                        {text}
                                    </p>
                                    <ChevronRight className="mt-6 size-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-lime-400" />
                                </a>
                            ))}
                        </div>
                    </section>

                    <section
                        id="productos"
                        className="border-y border-white/8 bg-[#08100b] py-24"
                    >
                        <div className="mx-auto max-w-7xl px-5 lg:px-8">
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                                <SectionHeading
                                    eyebrow="Selección destacada"
                                    title="Tecnología recomendada para ti"
                                    text="Una vista previa de los equipos que pronto encontrarás en nuestro catálogo."
                                    align="left"
                                />
                                <a
                                    href="#contacto"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-lime-400"
                                >
                                    Consultar catálogo{' '}
                                    <ArrowRight className="size-4" />
                                </a>
                            </div>
                            <div className="mt-12 grid gap-5 md:grid-cols-3">
                                {products.map(
                                    ({
                                        name,
                                        type,
                                        price,
                                        old,
                                        badge,
                                        icon: Icon,
                                    }) => (
                                        <article
                                            key={name}
                                            className="group overflow-hidden rounded-3xl border border-white/9 bg-[#0c140e]"
                                        >
                                            <div className="relative flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,rgba(123,255,61,.12),transparent_62%)]">
                                                <span className="absolute top-5 left-5 rounded-full bg-lime-400 px-3 py-1 text-xs font-black text-black">
                                                    {badge}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="absolute top-5 right-5 rounded-full border border-white/10 bg-black/30 p-2.5 text-white/50"
                                                    aria-label={`Agregar ${name} a favoritos`}
                                                >
                                                    <Heart className="size-4" />
                                                </button>
                                                <Icon
                                                    className="size-28 text-lime-300/80 transition group-hover:scale-105"
                                                    strokeWidth={1.1}
                                                />
                                            </div>
                                            <div className="border-t border-white/8 p-6">
                                                <p className="text-xs font-semibold tracking-wider text-lime-400/70 uppercase">
                                                    {type}
                                                </p>
                                                <h3 className="mt-2 text-lg font-bold">
                                                    {name}
                                                </h3>
                                                <div className="mt-3 flex gap-1 text-amber-300">
                                                    {Array.from({
                                                        length: 5,
                                                    }).map((_, index) => (
                                                        <Star
                                                            key={index}
                                                            className="size-3.5 fill-current"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="mt-5 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-xs text-white/30 line-through">
                                                            {old}
                                                        </p>
                                                        <p className="text-xl font-black">
                                                            {price}
                                                        </p>
                                                    </div>
                                                    <a
                                                        href="#contacto"
                                                        className="flex size-11 items-center justify-center rounded-full bg-lime-400 text-black"
                                                        aria-label={`Consultar ${name}`}
                                                    >
                                                        <ShoppingCart className="size-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    <section
                        id="servicios"
                        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
                    >
                        <SectionHeading
                            eyebrow="Más que tecnología"
                            title="Soluciones que trabajan contigo"
                            text="Experiencia técnica y visión de negocio para acompañarte en cada etapa."
                        />
                        <div className="mt-12 grid gap-4 md:grid-cols-2">
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
                        className="border-y border-white/8 bg-gradient-to-br from-[#0c1b10] to-[#050806] py-24"
                    >
                        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
                            <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 p-7">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(115,255,42,.16),transparent_55%)]" />
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
                        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
                    >
                        <SectionHeading
                            eyebrow="¿Por qué JBTECHLINE?"
                            title="Tu aliado estratégico en tecnología"
                            text="No solo vendemos productos: conectamos cada desafío con la solución correcta."
                        />
                        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/9 bg-white/9 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map(({ title, text, icon: Icon }) => (
                                <div key={title} className="bg-[#070b08] p-7">
                                    <Icon className="size-7 text-lime-400" />
                                    <h3 className="mt-6 font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-white/42">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="contacto" className="px-5 pb-24 lg:px-8">
                        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-lime-400/20 bg-gradient-to-r from-[#173a0d] via-[#0e260d] to-[#071008] px-7 py-14 sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
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
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {title}
            </h2>
            <p className="mt-4 leading-7 text-white/48">{text}</p>
        </div>
    );
}
