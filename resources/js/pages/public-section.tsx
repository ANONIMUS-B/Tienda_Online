import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Boxes,
    Code2,
    Cpu,
    Headphones,
    Laptop,
    Menu,
    MessageCircle,
    MonitorSmartphone,
    PackageCheck,
    Printer,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Store,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';

import {
    about,
    categories,
    dashboard,
    home,
    login,
    products,
    register,
    services,
    software,
} from '@/routes';

type Section = 'products' | 'categories' | 'services' | 'software' | 'about';
type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;
type PublicCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    children: Array<{ id: number; name: string; slug: string }>;
};

type SectionContent = {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    items: Array<{
        title: string;
        description: string;
        icon: Icon;
        label?: string;
    }>;
};

const sectionContent: Record<Section, SectionContent> = {
    products: {
        eyebrow: 'Catálogo tecnológico',
        title: 'Equipos que elevan',
        accent: 'tu rendimiento.',
        description:
            'Explora una selección de tecnología para trabajo, estudio, entretenimiento y crecimiento empresarial.',
        items: [
            {
                title: 'Laptops profesionales',
                description:
                    'Rendimiento, movilidad y autonomía para llegar más lejos.',
                icon: Laptop,
                label: 'Equipos',
            },
            {
                title: 'Monitores y pantallas',
                description:
                    'Precisión visual para productividad, diseño y entretenimiento.',
                icon: MonitorSmartphone,
                label: 'Visual',
            },
            {
                title: 'Componentes de PC',
                description:
                    'Actualiza, potencia y personaliza el corazón de tu equipo.',
                icon: Cpu,
                label: 'Performance',
            },
            {
                title: 'Impresión inteligente',
                description:
                    'Equipos y suministros para hogares, oficinas y negocios.',
                icon: Printer,
                label: 'Impresión',
            },
            {
                title: 'Tecnología móvil',
                description:
                    'Dispositivos y accesorios para mantenerte siempre conectado.',
                icon: Smartphone,
                label: 'Mobile',
            },
            {
                title: 'Soluciones empresariales',
                description:
                    'Infraestructura confiable diseñada para tu operación.',
                icon: Store,
                label: 'Empresas',
            },
        ],
    },
    categories: {
        eyebrow: 'Compra más fácil',
        title: 'Encuentra la tecnología',
        accent: 'por categoría.',
        description:
            'Organizamos nuestro catálogo para que encuentres rápidamente la solución que necesitas.',
        items: [
            {
                title: 'Cómputo',
                description:
                    'Laptops, computadoras de escritorio y estaciones de trabajo.',
                icon: Laptop,
            },
            {
                title: 'Componentes',
                description:
                    'Procesadores, memorias, almacenamiento y tarjetas gráficas.',
                icon: Cpu,
            },
            {
                title: 'Impresoras',
                description:
                    'Impresión doméstica, profesional y de alto volumen.',
                icon: Printer,
            },
            {
                title: 'Celulares y tablets',
                description:
                    'Equipos móviles para comunicación y productividad.',
                icon: Smartphone,
            },
            {
                title: 'Periféricos',
                description: 'Monitores, teclados, mouse, audio y accesorios.',
                icon: MonitorSmartphone,
            },
            {
                title: 'Software y licencias',
                description:
                    'Herramientas originales para personas y empresas.',
                icon: Code2,
            },
        ],
    },
    services: {
        eyebrow: 'Soporte especializado',
        title: 'Cuidamos tu tecnología,',
        accent: 'impulsamos tu negocio.',
        description:
            'Atención técnica profesional para mantener tus equipos y sistemas trabajando de forma segura y eficiente.',
        items: [
            {
                title: 'Mantenimiento preventivo',
                description:
                    'Limpieza, optimización y revisión integral de equipos.',
                icon: Wrench,
            },
            {
                title: 'Diagnóstico y reparación',
                description:
                    'Identificamos fallas y aplicamos soluciones confiables.',
                icon: Headphones,
            },
            {
                title: 'Instalación de programas',
                description:
                    'Configuración segura de software y herramientas de trabajo.',
                icon: Code2,
            },
            {
                title: 'Redes y conectividad',
                description:
                    'Conexiones estables para hogares, oficinas y empresas.',
                icon: Boxes,
            },
            {
                title: 'Soporte empresarial',
                description:
                    'Acompañamiento continuo para tu operación tecnológica.',
                icon: ShieldCheck,
            },
            {
                title: 'Actualización de equipos',
                description:
                    'Mejoras estratégicas para extender rendimiento y vida útil.',
                icon: Cpu,
            },
        ],
    },
    software: {
        eyebrow: 'Transformación digital',
        title: 'Software que se adapta',
        accent: 'a tu forma de crecer.',
        description:
            'Soluciones digitales, licencias y aplicaciones para simplificar procesos y convertir datos en decisiones.',
        items: [
            {
                title: 'Sistema de ventas POS',
                description:
                    'Controla ventas, caja y comprobantes desde un solo lugar.',
                icon: Store,
            },
            {
                title: 'Gestión de inventarios',
                description:
                    'Stock actualizado, movimientos y alertas inteligentes.',
                icon: PackageCheck,
            },
            {
                title: 'Licencias originales',
                description:
                    'Software auténtico con activación y asesoría especializada.',
                icon: ShieldCheck,
            },
            {
                title: 'Aplicaciones empresariales',
                description:
                    'Herramientas web y móviles alineadas con tu negocio.',
                icon: Smartphone,
            },
            {
                title: 'Desarrollo personalizado',
                description:
                    'Construimos soluciones únicas para procesos únicos.',
                icon: Code2,
            },
            {
                title: 'Automatización',
                description:
                    'Reduce tareas repetitivas y aprovecha mejor tu tiempo.',
                icon: Zap,
            },
        ],
    },
    about: {
        eyebrow: 'Conoce JBTECHLINE',
        title: 'Tecnología con propósito,',
        accent: 'servicio con visión.',
        description:
            'Somos un aliado tecnológico enfocado en entender cada necesidad y convertirla en una solución práctica, segura y escalable.',
        items: [
            {
                title: 'Asesoría honesta',
                description:
                    'Recomendamos lo que realmente necesitas para cumplir tus objetivos.',
                icon: MessageCircle,
            },
            {
                title: 'Experiencia técnica',
                description:
                    'Conocimiento aplicado a productos, soporte y soluciones digitales.',
                icon: Wrench,
            },
            {
                title: 'Visión empresarial',
                description:
                    'Entendemos que la tecnología debe generar resultados.',
                icon: Store,
            },
            {
                title: 'Acompañamiento',
                description:
                    'Seguimos contigo después de elegir e implementar una solución.',
                icon: Headphones,
            },
            {
                title: 'Innovación útil',
                description:
                    'Adoptamos tecnología cuando aporta valor real y medible.',
                icon: Sparkles,
            },
            {
                title: 'Confianza',
                description:
                    'Construimos relaciones de largo plazo basadas en responsabilidad.',
                icon: ShieldCheck,
            },
        ],
    },
};

const navigation = [
    { label: 'Inicio', route: home },
    { label: 'Productos', route: products },
    { label: 'Categorías', route: categories },
    { label: 'Servicios', route: services },
    { label: 'Software', route: software },
    { label: 'Nosotros', route: about },
];

export default function PublicSection({
    section,
    categories: categoryRecords = [],
}: {
    section: Section;
    categories?: PublicCategory[];
}) {
    const defaultContent = sectionContent[section];
    const content =
        section === 'categories'
            ? {
                  ...defaultContent,
                  items: categoryRecords.map((category) => ({
                      title: category.name,
                      description:
                          category.description ??
                          'Explora los productos disponibles en esta categoría.',
                      icon: Boxes,
                      label:
                          category.children.length > 0
                              ? `${category.children.length} subcategorías`
                              : 'Categoría',
                  })),
              }
            : defaultContent;
    const page = usePage();
    const { auth, currentTeam } = page.props;
    const [menuOpen, setMenuOpen] = useState(false);
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : home();

    return (
        <>
            <Head title={`${content.eyebrow} | JBTECHLINE`}>
                <meta name="description" content={content.description} />
            </Head>
            <div className="min-h-screen bg-[#050806] text-white selection:bg-lime-400 selection:text-black">
                <header className="border-b border-white/8 bg-[#050806]/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                        <Link href={home()} className="flex items-center gap-3">
                            <img
                                src="/images/brand/jbtechline-logo.png"
                                alt="JBTECHLINE"
                                className="h-16 w-20 object-contain"
                            />
                            <div className="hidden sm:block">
                                <p className="text-lg leading-none font-black">
                                    JB
                                    <span className="text-lime-400">
                                        TECHLINE
                                    </span>
                                </p>
                                <p className="mt-1 text-[9px] tracking-[.2em] text-white/45 uppercase">
                                    Tu aliado tecnológico
                                </p>
                            </div>
                        </Link>
                        <nav className="hidden items-center gap-7 lg:flex">
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.route()}
                                    className={`text-sm font-medium transition hover:text-lime-400 ${item.route().url === page.url ? 'text-lime-400' : 'text-white/60'}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="hidden items-center gap-2 lg:flex">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-black"
                                >
                                    Mi panel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-3 py-2 text-sm font-semibold text-white/70"
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
                        >
                            {menuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                    {menuOpen && (
                        <nav className="flex flex-col border-t border-white/8 bg-[#08100b] px-5 py-5 lg:hidden">
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.route()}
                                    className="rounded-xl px-4 py-3 text-sm text-white/70"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </header>

                <main>
                    <section className="relative overflow-hidden border-b border-white/8 py-24 sm:py-32">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(91,255,0,.14),transparent_28%)]" />
                        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(132,255,75,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(132,255,75,.08)_1px,transparent_1px)] [background-size:48px_48px] opacity-20" />
                        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                            <Link
                                href={home()}
                                className="mb-10 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-lime-400"
                            >
                                <ArrowLeft className="size-4" /> Volver al
                                inicio
                            </Link>
                            <p className="text-xs font-extrabold tracking-[.24em] text-lime-400 uppercase">
                                {content.eyebrow}
                            </p>
                            <h1 className="mt-5 max-w-4xl text-5xl leading-[1.04] font-black tracking-[-.04em] sm:text-6xl lg:text-7xl">
                                {content.title}{' '}
                                <span className="bg-gradient-to-r from-lime-300 to-emerald-500 bg-clip-text text-transparent">
                                    {content.accent}
                                </span>
                            </h1>
                            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/52">
                                {content.description}
                            </p>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
                        {content.items.length === 0 && (
                            <div className="rounded-3xl border border-white/9 bg-white/[.035] px-6 py-14 text-center text-white/50">
                                Próximamente publicaremos nuestras categorías
                                tecnológicas.
                            </div>
                        )}
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {content.items.map(
                                (
                                    { title, description, icon: Icon, label },
                                    index,
                                ) => (
                                    <article
                                        key={title}
                                        className="group rounded-3xl border border-white/9 bg-white/[.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-lime-400/35 hover:bg-lime-400/[.05]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex size-14 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
                                                <Icon className="size-7" />
                                            </div>
                                            <span className="text-xs font-bold tracking-wider text-white/20">
                                                {label ?? `0${index + 1}`}
                                            </span>
                                        </div>
                                        <h2 className="mt-8 text-xl font-bold">
                                            {title}
                                        </h2>
                                        <p className="mt-3 leading-7 text-white/45">
                                            {description}
                                        </p>
                                        <div className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-lime-400">
                                            Solicitar información{' '}
                                            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>

                    <section className="px-5 pb-24 lg:px-8">
                        <div className="mx-auto flex max-w-7xl flex-col gap-8 overflow-hidden rounded-[2.5rem] border border-lime-400/20 bg-gradient-to-r from-[#173a0d] to-[#071008] px-7 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs font-extrabold tracking-[.2em] text-lime-300 uppercase">
                                    Asesoría personalizada
                                </p>
                                <h2 className="mt-3 text-3xl font-black">
                                    ¿Necesitas ayuda para elegir?
                                </h2>
                                <p className="mt-3 text-white/50">
                                    Conversemos y encontremos juntos la solución
                                    adecuada.
                                </p>
                            </div>
                            <a
                                href="https://wa.me/"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-lime-400 px-7 py-4 font-extrabold text-black"
                            >
                                <MessageCircle className="size-5" /> Hablar con
                                un asesor
                            </a>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/8 px-5 py-8 text-center text-xs text-white/30">
                    <p>
                        © {new Date().getFullYear()} JBTECHLINE · Tu aliado
                        estratégico en tecnología.
                    </p>
                </footer>
            </div>
        </>
    );
}
