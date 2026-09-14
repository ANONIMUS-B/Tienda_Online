import { Head, Link } from '@inertiajs/react';
import { Code2, Package, Search, Wrench } from 'lucide-react';
import { search } from '@/routes';

type SearchResult = {
    id: string;
    type: 'products' | 'software' | 'programs' | 'services';
    type_label: string;
    title: string;
    description: string | null;
    meta: string;
    image: string | null;
    url: string;
};
const icons = {
    products: Package,
    software: Code2,
    programs: Code2,
    services: Wrench,
};

export default function GlobalSearch({
    results,
    filters,
}: {
    results: SearchResult[];
    filters: { q: string; type: string };
}) {
    return (
        <div className="bg-brand-background min-h-screen text-white">
            <Head title="Buscar | JBTECHLINE" />
            <main className="mx-auto max-w-7xl px-5 pt-24 pb-14 sm:pt-28">
                <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                    Buscador global
                </p>
                <h1 className="mt-3 text-4xl font-black">
                    Encuentra todo en{' '}
                    <span className="text-lime-400">un solo lugar.</span>
                </h1>
                <form
                    action={search().url}
                    method="get"
                    className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-4 md:grid-cols-[1fr_220px_auto]"
                >
                    <input
                        name="q"
                        type="search"
                        defaultValue={filters.q}
                        placeholder="Producto, programa, servicio o software..."
                        className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-lime-400/50"
                    />
                    <select
                        name="type"
                        defaultValue={filters.type}
                        className="border-brand-support/20 bg-brand-background h-12 rounded-xl border px-4"
                    >
                        <option value="all">Buscar en todo</option>
                        <option value="products">Productos</option>
                        <option value="software">Software propio</option>
                        <option value="programs">Programas</option>
                        <option value="services">Servicios</option>
                    </select>
                    <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-lime-400 px-7 font-bold text-black">
                        <Search className="size-4" /> Buscar
                    </button>
                </form>
                {filters.q && (
                    <p className="mt-8 text-sm text-white/45">
                        {results.length} resultado(s) para “{filters.q}”
                    </p>
                )}
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((result) => {
                        const Icon = icons[result.type];
                        return (
                            <Link
                                key={result.id}
                                href={result.url}
                                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-lime-400/35"
                            >
                                <div className="flex h-40 items-center justify-center bg-white/5">
                                    {result.image ? (
                                        <img
                                            src={result.image}
                                            alt={result.title}
                                            loading="lazy"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <Icon className="size-12 text-lime-400/45" />
                                    )}
                                </div>
                                <div className="p-6">
                                    <span className="text-xs font-bold tracking-wider text-lime-400 uppercase">
                                        {result.type_label}
                                    </span>
                                    <h2 className="mt-2 text-xl font-bold">
                                        {result.title}
                                    </h2>
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/45">
                                        {result.description}
                                    </p>
                                    <p className="mt-5 text-sm font-semibold text-white/70">
                                        {result.meta}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {filters.q && results.length === 0 && (
                    <div className="mt-10 rounded-3xl border border-white/10 p-14 text-center text-white/45">
                        No encontramos coincidencias. Prueba otra palabra o
                        selecciona “Buscar en todo”.
                    </div>
                )}
            </main>
        </div>
    );
}
