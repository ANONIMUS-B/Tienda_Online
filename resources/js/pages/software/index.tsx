import { Head, Link, usePage } from '@inertiajs/react';
import { Code2, Download, FileText, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ProgramDetailModal from '@/components/program-detail-modal';
import SoftwareQuoteModal from '@/components/software-quote-modal';
import { software } from '@/routes';
import { index as programsIndex } from '@/routes/programs';
import type { SoftwareProgram } from '@/types/software';
export default function SoftwareIndex({
    catalogType,
    programs,
    categories,
    platforms,
    filters,
    membership,
}: {
    catalogType: 'software' | 'programs';
    programs: {
        data: SoftwareProgram[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: string[];
    platforms: string[];
    filters: Record<string, string>;
    membership?: {
        enabled: boolean;
        monthly_price: number;
        annual_price: number;
        yape_enabled: boolean;
        transfer_enabled: boolean;
        yape_number: string | null;
        bank_name: string | null;
        bank_account: string | null;
        active: boolean;
    };
}) {
    const isPrograms = catalogType === 'programs';
    const { auth } = usePage().props;
    const [selectedProgram, setSelectedProgram] =
        useState<SoftwareProgram | null>(null);
    const [quoteOpen, setQuoteOpen] = useState(false);
    const membershipOptions = membership ?? {
        enabled: false,
        monthly_price: 0,
        annual_price: 0,
        yape_enabled: false,
        transfer_enabled: false,
        yape_number: null,
        bank_name: null,
        bank_account: null,
        active: false,
    };
    return (
        <div className="bg-brand-background min-h-screen text-white">
            <Head
                title={`${isPrograms ? 'Programas' : 'Software'} | JBTECHLINE`}
            />
            <main className="mx-auto max-w-7xl px-5 pt-24 pb-14 sm:pt-28">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-black sm:text-4xl">
                        {isPrograms
                            ? 'Programas disponibles'
                            : 'Software disponible'}
                    </h1>
                    {!isPrograms && (
                        <button
                            type="button"
                            onClick={() => setQuoteOpen(true)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-bold text-slate-900"
                        >
                            <FileText className="size-4" /> Cotizar desarrollo
                        </button>
                    )}
                </div>
                <form
                    action={(isPrograms ? programsIndex() : software()).url}
                    method="get"
                    className="mt-7 grid gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-4 md:grid-cols-[1fr_220px_220px_auto]"
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
                        className="border-brand-support/20 bg-brand-background h-11 rounded-xl border px-4"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((x) => (
                            <option key={x}>{x}</option>
                        ))}
                    </select>
                    <select
                        name="platform"
                        defaultValue={filters.platform}
                        className="border-brand-support/20 bg-brand-background h-11 rounded-xl border px-4"
                    >
                        <option value="">Todas las plataformas</option>
                        {platforms.map((x) => (
                            <option key={x}>{x}</option>
                        ))}
                    </select>
                    <button className="h-11 rounded-xl bg-lime-400 px-6 font-bold text-black">
                        Filtrar
                    </button>
                </form>
                <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {programs.data.map((program) => (
                        <button
                            type="button"
                            key={program.id}
                            onClick={() => setSelectedProgram(program)}
                            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] text-left"
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
                        </button>
                    ))}
                </div>
                {programs.data.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-10 text-center text-slate-500">
                        No hay software publicado con estos filtros.
                    </div>
                )}
                <nav
                    className="mt-8 flex flex-wrap justify-center gap-2"
                    aria-label="Páginas del catálogo"
                >
                    {programs.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                preserveScroll
                                className={`rounded-lg border px-3 py-2 text-sm ${link.active ? 'border-cyan-400 bg-cyan-400 font-bold text-slate-900' : 'border-cyan-100 bg-white text-slate-600'}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : null,
                    )}
                </nav>
            </main>
            {selectedProgram && (
                <ProgramDetailModal
                    program={selectedProgram}
                    membership={membershipOptions}
                    isAuthenticated={Boolean(auth.user)}
                    onClose={() => setSelectedProgram(null)}
                />
            )}
            {quoteOpen && (
                <SoftwareQuoteModal
                    isAuthenticated={Boolean(auth.user)}
                    onClose={() => setQuoteOpen(false)}
                />
            )}
        </div>
    );
}
