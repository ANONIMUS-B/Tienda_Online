import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProductDetailModal from '@/components/product-detail-modal';
import {
    brands as brandsPage,
    categories as categoriesPage,
    home,
    products,
} from '@/routes';
import type { Product } from '@/types/product';
type Paginator = {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
};
type Option = { name: string; slug: string };
export default function ProductCatalog({
    products: result,
    categories = [],
    brands = [],
    filters = {},
}: {
    products: Paginator;
    categories?: Option[];
    brands?: Option[];
    filters?: Record<string, string>;
}) {
    const categoryOptions = Array.isArray(categories) ? categories : [];
    const brandOptions = Array.isArray(brands) ? brands : [];
    const [searchQuery, setSearchQuery] = useState(filters.q ?? '');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }
        },
        [],
    );

    function searchAsYouType(value: string) {
        setSearchQuery(value);

        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }

        searchTimer.current = setTimeout(() => {
            router.get(
                products().url,
                { ...filters, q: value || undefined },
                {
                    only: ['products', 'filters'],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 250);
    }

    return (
        <>
            <Head title="Productos | JBTECHLINE" />
            <div className="bg-brand-background min-h-screen text-white">
                <div className="hidden">
                    <header className="border-b border-white/10">
                        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
                            <Link href={home()} className="text-xl font-black">
                                JB
                                <span className="text-lime-400">TECHLINE</span>
                            </Link>
                            <nav className="flex gap-5 text-sm text-white/60">
                                <Link
                                    href={products()}
                                    className="text-lime-400"
                                >
                                    Productos
                                </Link>
                                <Link href={categoriesPage()}>Categorías</Link>
                                <Link href={brandsPage()}>Marcas</Link>
                            </nav>
                        </div>
                    </header>
                </div>
                <main className="mx-auto max-w-7xl px-5 pt-24 pb-12 sm:pt-28">
                    <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                        Catálogo tecnológico
                    </p>
                    <h1 className="mt-3 text-3xl font-black sm:mt-4 sm:text-5xl">
                        Productos para{' '}
                        <span className="text-lime-400">avanzar.</span>
                    </h1>
                    <form
                        action={products().url}
                        method="get"
                        className="sticky top-20 z-30 mt-7 grid grid-cols-2 gap-3 rounded-3xl border border-cyan-200 bg-white/95 p-4 shadow-lg shadow-cyan-950/8 backdrop-blur-xl lg:grid-cols-[minmax(240px,1fr)_170px_170px_125px_125px_auto]"
                    >
                        <div className="relative col-span-2 lg:col-span-1">
                            <Search className="absolute top-3.5 left-4 size-4 text-white/35" />
                            <input
                                name="q"
                                value={searchQuery}
                                onChange={(event) =>
                                    searchAsYouType(event.target.value)
                                }
                                placeholder="Buscar producto o SKU"
                                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pr-4 pl-11"
                            />
                        </div>
                        <select
                            name="category"
                            defaultValue={filters.category}
                            className="border-brand-support/20 bg-brand-background h-11 rounded-xl border px-4"
                        >
                            <option value="">Todas las categorías</option>
                            {categoryOptions.map((x) => (
                                <option key={x.slug} value={x.slug}>
                                    {x.name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="brand"
                            defaultValue={filters.brand}
                            className="border-brand-support/20 bg-brand-background h-11 rounded-xl border px-4"
                        >
                            <option value="">Todas las marcas</option>
                            {brandOptions.map((x) => (
                                <option key={x.slug} value={x.slug}>
                                    {x.name}
                                </option>
                            ))}
                        </select>
                        <label className="sr-only" htmlFor="min_price">
                            Precio mínimo
                        </label>
                        <input
                            id="min_price"
                            type="number"
                            name="min_price"
                            min="0"
                            step="0.01"
                            defaultValue={filters.min_price}
                            placeholder="Precio mín."
                            className="h-11 rounded-xl border border-cyan-200 bg-white px-4 text-slate-800 placeholder:text-slate-400"
                        />
                        <label className="sr-only" htmlFor="max_price">
                            Precio máximo
                        </label>
                        <input
                            id="max_price"
                            type="number"
                            name="max_price"
                            min="0"
                            step="0.01"
                            defaultValue={filters.max_price}
                            placeholder="Precio máx."
                            className="h-11 rounded-xl border border-cyan-200 bg-white px-4 text-slate-800 placeholder:text-slate-400"
                        />
                        <button className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 font-bold text-black lg:col-span-1">
                            <Filter className="size-4" />
                            Filtrar
                        </button>
                    </form>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {result.data.map((product) => (
                            <button
                                type="button"
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="group border-brand-support/20 hover:border-brand-primary/70 overflow-hidden rounded-3xl border bg-black/25 transition duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                            >
                                <div className="text-left">
                                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-b from-white/5 via-lime-400/5 to-transparent p-6">
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0].path}
                                                alt={product.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="max-h-full max-w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-white/25">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <p className="text-[10px] font-bold tracking-widest text-lime-400 uppercase">
                                            {product.brand?.name ??
                                                product.category?.name}
                                        </p>
                                        <h2 className="mt-1.5 line-clamp-1 font-bold text-white transition-colors group-hover:text-lime-300">
                                            {product.name}
                                        </h2>
                                        <p className="mt-2 line-clamp-2 text-xs text-white/45">
                                            {product.short_description}
                                        </p>
                                        <div className="mt-5 flex items-center justify-between">
                                            <div>
                                                {product.promotional_price && (
                                                    <p className="text-xs text-white/30 line-through">
                                                        S/ {product.price}
                                                    </p>
                                                )}
                                                <p className="text-xl font-black text-lime-300">
                                                    S/{' '}
                                                    {product.promotional_price ??
                                                        product.price}
                                                </p>
                                            </div>
                                            <span className="flex size-10 items-center justify-center rounded-full bg-lime-400 text-black shadow-[0_0_15px_rgb(0_247_255/.35)] transition hover:scale-105 hover:bg-lime-300">
                                                <ShoppingCart className="size-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {result.data.length === 0 && (
                            <p className="col-span-full rounded-3xl border border-white/10 p-14 text-center text-white/45">
                                No encontramos productos con esos filtros.
                            </p>
                        )}
                    </div>
                    <div className="mt-10 flex flex-wrap justify-center gap-2">
                        {result.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-lime-400 text-black' : 'bg-white/5 text-white/60'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : null,
                        )}
                    </div>
                </main>
            </div>
            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    );
}
