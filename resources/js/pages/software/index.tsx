import { Head, Link } from '@inertiajs/react';
import { Code2, Download, Search, Sparkles } from 'lucide-react';
import { contact, software } from '@/routes';
import { show } from '@/routes/software';
import { index as programsIndex, show as programShow } from '@/routes/programs';
import type { SoftwareProgram } from '@/types/software';
export default function SoftwareIndex({
    catalogType,
    programs,
    categories,
    platforms,
    filters,
}: {
    catalogType: 'software' | 'programs';
    programs: { data: SoftwareProgram[] };
    categories: string[];
    platforms: string[];
    filters: Record<string, string>;
}) {
    const isPrograms = catalogType === 'programs';
    return (
        <div className="min-h-screen bg-[#101a17] text-white">
            <Head
                title={`${isPrograms ? 'Programas' : 'Software'} | JBTECHLINE`}
            />
            <main className="mx-auto max-w-7xl px-5 pt-32 pb-20">
                <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                    {isPrograms ? 'Programas disponibles' : 'Desarrollo propio'}
                </p>
                <h1 className="mt-4 text-5xl font-black">
                    {isPrograms
                        ? 'Herramientas para trabajar '
                        : 'Software creado para ti '}
                    <span className="text-lime-400">mejor.</span>
                </h1>
                <p className="mt-5 max-w-3xl text-white/50">
                    {isPrograms
                        ? 'Aquí encontrarás únicamente los programas publicados por el administrador. Inicia sesión o crea una cuenta para descargarlos.'
                        : 'Conoce los sistemas de facturación, ventas y aplicaciones desarrolladas por JBTECHLINE. Solicita una demostración o cotiza una solución adaptada a tu negocio.'}
                </p>
                <form
                    action={(isPrograms ? programsIndex() : software()).url}
                    method="get"
                    className="mt-10 grid gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-4 md:grid-cols-[1fr_220px_220px_auto]"
                >
                    <div className="relative">
                        <Search className="absolute top-3.5 left-4 size-4 text-white/35" />
                        <input
                            name="q"
                            defaultValue={filters.q}
                            placeholder="Buscar programa"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pr-4 pl-11"
                        />
                    </div>
                    <select
                        name="category"
                        defaultValue={filters.category}
                        className="rounded-xl border border-white/10 bg-[#182722] px-4"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((x) => (
                            <option key={x}>{x}</option>
                        ))}
                    </select>
                    <select
                        name="platform"
                        defaultValue={filters.platform}
                        className="rounded-xl border border-white/10 bg-[#182722] px-4"
                    >
                        <option value="">Todas las plataformas</option>
                        {platforms.map((x) => (
                            <option key={x}>{x}</option>
                        ))}
                    </select>
                    <button className="rounded-xl bg-lime-400 px-6 font-bold text-black">
                        Filtrar
                    </button>
                </form>
                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {programs.data.map((program) => (
                        <Link
                            key={program.id}
                            href={
                                isPrograms
                                    ? programShow(program.slug)
                                    : show(program.slug)
                            }
                            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"
                        >
                            <div className="aspect-video bg-white/5">
                                {program.image_url ? (
                                    <img
                                        src={program.image_url}
                                        alt={program.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center">
                                        <Code2 className="size-14 text-lime-400/40" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between text-xs text-lime-400">
                                    <span>
                                        {program.category} · {program.platform}
                                    </span>
                                    {program.is_own && (
                                        <span className="flex gap-1">
                                            <Sparkles className="size-3" />
                                            JBTECHLINE
                                        </span>
                                    )}
                                </div>
                                <h2 className="mt-3 text-xl font-bold">
                                    {program.name}
                                </h2>
                                <p className="mt-3 line-clamp-2 text-sm text-white/45">
                                    {program.short_description}
                                </p>
                                <div className="mt-5 flex justify-between">
                                    <b>
                                        {program.license_type === 'free'
                                            ? 'Gratis'
                                            : program.price
                                              ? `S/ ${program.price}`
                                              : isPrograms
                                                ? 'Licencia requerida'
                                                : 'Cotizar'}
                                    </b>
                                    <Download className="size-5 text-lime-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {!isPrograms ? <section className="mt-16 flex flex-col justify-between gap-6 rounded-[2rem] border border-lime-400/20 bg-lime-400/[.06] p-8 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-black">
                            ¿Necesitas un software a medida?
                        </h2>
                        <p className="mt-2 text-white/50">
                            Cotiza sistemas web, facturación, inventario,
                            aplicaciones móviles e integraciones.
                        </p>
                    </div>
                    <Link
                        href={contact()}
                        className="shrink-0 rounded-full bg-lime-400 px-7 py-4 font-bold text-black"
                    >
                        Cotizar desarrollo
                    </Link>
                </section> : null}
            </main>
        </div>
    );
}
