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
    Search,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Store,
    ShoppingCart,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';

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
import { index as cart } from '@/routes/cart';

type Section =
    | 'products'
    | 'categories'
    | 'services'
    | 'software'
    | 'apps'
    | 'brands'
    | 'about'
    | 'blog'
    | 'contact'
    | 'search'
    | 'cart';
type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;
type PublicCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    children: Array<{ id: number; name: string; slug: string }>;
};
type PublicBrand = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo_path: string | null;
    website_url: string | null;
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
        imagePath?: string | null;
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
    apps: {
        eyebrow: 'Aplicaciones inteligentes',
        title: 'Experiencias digitales',
        accent: 'en cualquier dispositivo.',
        description:
            'Aplicaciones web, Android, iOS y soluciones empresariales creadas para simplificar tu operación.',
        items: [
            {
                title: 'Aplicaciones Android',
                description:
                    'Soluciones móviles ágiles para clientes y equipos de trabajo.',
                icon: Smartphone,
                label: 'Android',
            },
            {
                title: 'Aplicaciones iOS',
                description:
                    'Experiencias cuidadas, seguras y optimizadas para Apple.',
                icon: MonitorSmartphone,
                label: 'iOS',
            },
            {
                title: 'Apps empresariales',
                description:
                    'Procesos, reportes y operaciones disponibles desde cualquier lugar.',
                icon: Store,
                label: 'Business',
            },
            {
                title: 'Aplicaciones web',
                description:
                    'Plataformas modernas que funcionan sin instalaciones complejas.',
                icon: Code2,
                label: 'Web',
            },
            {
                title: 'Integraciones',
                description:
                    'Conecta sistemas, datos y servicios en un mismo flujo.',
                icon: Boxes,
                label: 'API',
            },
            {
                title: 'Desarrollo personalizado',
                description:
                    'Una solución diseñada desde cero alrededor de tu negocio.',
                icon: Sparkles,
                label: 'A medida',
            },
        ],
    },
    brands: {
        eyebrow: 'Marcas de confianza',
        title: 'Tecnología respaldada',
        accent: 'por grandes fabricantes.',
        description:
            'Seleccionamos marcas reconocidas y soluciones confiables para cada necesidad tecnológica.',
        items: [
            {
                title: 'Cómputo profesional',
                description:
                    'Fabricantes líderes en laptops, PCs y estaciones de trabajo.',
                icon: Laptop,
                label: 'Equipos',
            },
            {
                title: 'Componentes',
                description:
                    'Rendimiento y compatibilidad para construir mejores equipos.',
                icon: Cpu,
                label: 'Hardware',
            },
            {
                title: 'Impresión',
                description:
                    'Equipos, consumibles y soporte para cada volumen de trabajo.',
                icon: Printer,
                label: 'Print',
            },
            {
                title: 'Dispositivos móviles',
                description:
                    'Tecnología para comunicarte y producir en movimiento.',
                icon: Smartphone,
                label: 'Mobile',
            },
            {
                title: 'Seguridad',
                description:
                    'Fabricantes especializados en protección y continuidad.',
                icon: ShieldCheck,
                label: 'Security',
            },
            {
                title: 'Software original',
                description:
                    'Licenciamiento auténtico con asesoría antes y después de la compra.',
                icon: Code2,
                label: 'Software',
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
    blog: {
        eyebrow: 'Blog y noticias',
        title: 'Decisiones tecnológicas',
        accent: 'mejor informadas.',
        description:
            'Consejos, tutoriales, comparativas y novedades para aprovechar mejor la tecnología.',
        items: [
            {
                title: 'Guías de compra',
                description:
                    'Criterios claros para elegir equipos, componentes y accesorios.',
                icon: Laptop,
                label: 'Guías',
            },
            {
                title: 'Consejos de soporte',
                description:
                    'Buenas prácticas para cuidar el rendimiento y la seguridad.',
                icon: Wrench,
                label: 'Soporte',
            },
            {
                title: 'Transformación digital',
                description:
                    'Ideas prácticas para modernizar procesos empresariales.',
                icon: Zap,
                label: 'Negocios',
            },
            {
                title: 'Comparativas',
                description:
                    'Diferencias importantes antes de tomar una decisión de compra.',
                icon: Boxes,
                label: 'Análisis',
            },
            {
                title: 'Seguridad tecnológica',
                description:
                    'Recomendaciones para proteger información y dispositivos.',
                icon: ShieldCheck,
                label: 'Seguridad',
            },
            {
                title: 'Novedades JBTECHLINE',
                description:
                    'Lanzamientos, promociones y noticias de nuestra comunidad.',
                icon: Sparkles,
                label: 'Noticias',
            },
        ],
    },
    contact: {
        eyebrow: 'Contacto',
        title: 'Conversemos sobre',
        accent: 'tu próxima solución.',
        description:
            'Cuéntanos qué necesitas y recibe acompañamiento tecnológico personalizado.',
        items: [
            {
                title: 'Asesoría comercial',
                description:
                    'Te ayudamos a elegir productos, software y licencias.',
                icon: MessageCircle,
                label: 'Ventas',
            },
            {
                title: 'Soporte técnico',
                description:
                    'Diagnóstico, mantenimiento y solución de incidencias.',
                icon: Headphones,
                label: 'Soporte',
            },
            {
                title: 'Proyectos empresariales',
                description:
                    'Soluciones escalables alineadas con tus objetivos.',
                icon: Store,
                label: 'Empresas',
            },
        ],
    },
    search: {
        eyebrow: 'Buscador global',
        title: 'Encuentra exactamente',
        accent: 'lo que necesitas.',
        description:
            'Busca productos, categorías, servicios, software y aplicaciones desde un solo lugar.',
        items: [
            {
                title: 'Productos y equipos',
                description:
                    'Explora tecnología por nombre, categoría o necesidad.',
                icon: Laptop,
            },
            {
                title: 'Servicios especializados',
                description:
                    'Encuentra soporte, mantenimiento e instalaciones.',
                icon: Wrench,
            },
            {
                title: 'Software y aplicaciones',
                description: 'Descubre herramientas digitales para crecer.',
                icon: Code2,
            },
        ],
    },
    cart: {
        eyebrow: 'Tu selección',
        title: 'Prepara tu solicitud',
        accent: 'con total claridad.',
        description:
            'Reúne productos, licencias y servicios antes de solicitar atención o una cotización.',
        items: [
            {
                title: 'Agrega soluciones',
                description:
                    'Selecciona los productos y servicios que te interesan.',
                icon: PackageCheck,
            },
            {
                title: 'Revisa cantidades',
                description: 'Organiza tu selección y obtén un total estimado.',
                icon: Boxes,
            },
            {
                title: 'Solicita asesoría',
                description:
                    'Envía tu selección para recibir atención personalizada.',
                icon: MessageCircle,
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
    { label: 'Apps', route: apps },
    { label: 'Marcas', route: brands },
    { label: 'Nosotros', route: about },
    { label: 'Blog', route: blog },
    { label: 'Contacto', route: contact },
];

export default function PublicSection({
    section,
    categories: categoryRecords = [],
    brands: brandRecords = [],
}: {
    section: Section;
    categories?: PublicCategory[];
    brands?: PublicBrand[];
}) {
    const defaultContent = sectionContent[section];
    const content: SectionContent =
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
            : section === 'brands'
              ? {
                    ...defaultContent,
                    items: brandRecords.map((brand) => ({
                        title: brand.name,
                        description:
                            brand.description ??
                            'TecnologÃ­a confiable disponible con asesorÃ­a especializada.',
                        icon: Store,
                        label: 'Marca oficial',
                        imagePath: brand.logo_path,
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
                    <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 lg:px-8">
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
                        <nav className="hidden items-center gap-4 xl:flex">
                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.route()}
                                    className={`text-xs font-medium transition hover:text-lime-400 ${item.route().url === page.url ? 'text-lime-400' : 'text-white/60'}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="hidden items-center gap-1 lg:flex">
                            <Link
                                href={search()}
                                className="rounded-full p-2.5 text-white/70 hover:bg-white/8 hover:text-lime-400"
                                aria-label="Buscar"
                            >
                                <Search className="size-5" />
                            </Link>
                            <Link
                                href={cart()}
                                className="rounded-full p-2.5 text-white/70 hover:bg-white/8 hover:text-lime-400"
                                aria-label="Carrito"
                            >
                                <ShoppingCart className="size-5" />
                            </Link>
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
                            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/8 pt-4">
                                <Link
                                    href={search()}
                                    className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm"
                                >
                                    Buscar
                                </Link>
                                <Link
                                    href={cart()}
                                    className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm"
                                >
                                    Carrito
                                </Link>
                            </div>
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

                    {section === 'search' && (
                        <section className="mx-auto max-w-4xl px-5 pt-16 lg:px-8">
                            <form
                                action={search().url}
                                method="get"
                                className="flex flex-col gap-3 rounded-3xl border border-lime-400/20 bg-white/[.04] p-4 sm:flex-row"
                            >
                                <label htmlFor="q" className="sr-only">
                                    Buscar en JBTECHLINE
                                </label>
                                <input
                                    id="q"
                                    name="q"
                                    type="search"
                                    placeholder="Ejemplo: laptop, mantenimiento, sistema POS…"
                                    className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-5 text-white outline-none placeholder:text-white/30 focus:border-lime-400/50"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-7 font-bold text-black"
                                >
                                    <Search className="size-5" /> Buscar
                                </button>
                            </form>
                        </section>
                    )}

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
                                    {
                                        title,
                                        description,
                                        icon: Icon,
                                        label,
                                        imagePath,
                                    },
                                    index,
                                ) => (
                                    <article
                                        key={title}
                                        className="group rounded-3xl border border-white/9 bg-white/[.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-lime-400/35 hover:bg-lime-400/[.05]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex size-14 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
                                                {imagePath ? (
                                                    <img
                                                        src={imagePath}
                                                        alt=""
                                                        className="size-full bg-white object-contain p-2"
                                                    />
                                                ) : (
                                                    <Icon className="size-7" />
                                                )}
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
