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
    Sparkles,
    Star,
    Store,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

import { dashboard, login, register } from '@/routes';

const navigation = [
    ['Inicio', '#inicio'],
    ['Productos', '#productos'],
    ['Categorías', '#categorias'],
    ['Servicios', '#servicios'],
    ['Software', '#software'],
    ['Nosotros', '#nosotros'],
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

export default function Welcome() {
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
                            {navigation.map(([label, href]) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="text-sm font-medium text-white/65 transition hover:text-lime-400"
                                >
                                    {label}
                                </a>
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
                                {navigation.map(([label, href]) => (
                                    <a
                                        key={label}
                                        href={href}
                                        onClick={() => setMenuOpen(false)}
                                        className="rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/5"
                                    >
                                        {label}
                                    </a>
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
                        className="relative flex min-h-[760px] items-center pt-28"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_42%,rgba(91,255,0,.13),transparent_28%),radial-gradient(circle_at_20%_85%,rgba(0,120,46,.15),transparent_35%)]" />
                        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(132,255,75,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(132,255,75,.08)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_90%)] [background-size:48px_48px] opacity-25" />
                        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
                            <div>
                                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/8 px-4 py-2 text-xs font-bold tracking-[.16em] text-lime-300 uppercase">
                                    <Sparkles className="size-4" /> Soluciones
                                    que impulsan tu futuro
                                </div>
                                <h1 className="max-w-3xl text-5xl leading-[1.02] font-black tracking-[-.04em] sm:text-6xl lg:text-7xl">
                                    Tecnología que transforma{' '}
                                    <span className="bg-gradient-to-r from-lime-300 via-[#61ef00] to-emerald-500 bg-clip-text text-transparent">
                                        tu manera de avanzar.
                                    </span>
                                </h1>
                                <p className="mt-7 max-w-xl text-lg leading-8 text-white/58">
                                    Productos, soporte, software y soluciones
                                    empresariales diseñadas para conectar tus
                                    ideas con resultados reales.
                                </p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href="#productos"
                                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-4 text-sm font-extrabold text-black shadow-[0_0_40px_rgba(105,255,0,.22)] hover:bg-lime-300"
                                    >
                                        Explorar productos{' '}
                                        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                                    </a>
                                    <a
                                        href="#contacto"
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-bold"
                                    >
                                        <MessageCircle className="size-4 text-lime-400" />{' '}
                                        Hablar con un asesor
                                    </a>
                                </div>
                                <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/45">
                                    {[
                                        'Asesoría personalizada',
                                        'Compra segura',
                                        'Soporte especializado',
                                    ].map((item) => (
                                        <span
                                            key={item}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="size-4 text-lime-400" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="relative mx-auto w-full max-w-[560px]">
                                <div className="absolute inset-12 rounded-full bg-lime-400/20 blur-[90px]" />
                                <div className="relative aspect-square rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[.02] p-8 shadow-2xl backdrop-blur-sm">
                                    <div className="absolute inset-5 rounded-[2rem] border border-lime-300/10" />
                                    <div className="absolute top-8 right-8 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/55">
                                        <span className="size-2 animate-pulse rounded-full bg-lime-400" />{' '}
                                        Tecnología activa
                                    </div>
                                    <img
                                        src="/images/brand/jbtechline-logo.png"
                                        alt="Logo oficial de JBTECHLINE"
                                        className="relative z-10 h-full w-full object-contain drop-shadow-[0_25px_45px_rgba(56,220,0,.22)]"
                                    />
                                    <CircuitBoard className="absolute bottom-9 left-9 size-8 text-lime-400/35" />
                                </div>
                            </div>
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
