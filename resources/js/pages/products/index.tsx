import { Head, Link } from '@inertiajs/react';
import { Filter, Search, ShoppingCart } from 'lucide-react';
import {
    brands as brandsPage,
    categories as categoriesPage,
    home,
    products,
} from '@/routes';
import { show } from '@/routes/products';
import type { Product } from '@/types/product';
import PublicHeader from '@/components/public-header';
type Paginator = {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
};
type Option = { name: string; slug: string };
export default function ProductCatalog({
    products: result,
    categories,
    brands,
    filters,
}: {
    products: Paginator;
    categories: Option[];
    brands: Option[];
    filters: Record<string, string>;
}) {
    return (
        <>
            <Head title="Productos | JBTECHLINE" />
            <div className="min-h-screen bg-[#050806] text-white">
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
                <PublicHeader />
                <main className="mx-auto max-w-7xl px-5 pt-32 pb-16">
                    <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                        Catálogo tecnológico
                    </p>
                    <h1 className="mt-4 text-5xl font-black">
                        Productos para{' '}
                        <span className="text-lime-400">avanzar.</span>
                    </h1>
                    <form
                        action={products().url}
                        method="get"
                        className="mt-10 grid gap-3 rounded-3xl border border-white/10 bg-white/[.04] p-4 md:grid-cols-[1fr_220px_220px_auto]"
                    >
                        <div className="relative">
                            <Search className="absolute top-3.5 left-4 size-4 text-white/35" />
                            <input
                                name="q"
                                defaultValue={filters.q}
                                placeholder="Buscar producto o SKU"
                                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pr-4 pl-11"
                            />
                        </div>
                        <select
                            name="category"
                            defaultValue={filters.category}
                            className="rounded-xl border border-white/10 bg-[#0b120d] px-4"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((x) => (
                                <option key={x.slug} value={x.slug}>
                                    {x.name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="brand"
                            defaultValue={filters.brand}
                            className="rounded-xl border border-white/10 bg-[#0b120d] px-4"
                        >
                            <option value="">Todas las marcas</option>
                            {brands.map((x) => (
                                <option key={x.slug} value={x.slug}>
                                    {x.name}
                                </option>
                            ))}
                        </select>
                        <button className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 font-bold text-black">
                            <Filter className="size-4" />
                            Filtrar
                        </button>
                    </form>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {result.data.map((product) => (
                            <article
                                key={product.id}
                                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"
                            >
                                <Link href={show(product.slug)}>
                                    <div className="aspect-square overflow-hidden bg-white/5">
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0].path}
                                                alt={product.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="size-full object-cover transition group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-white/25">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-lime-400">
                                            {product.brand?.name ??
                                                product.category?.name}
                                        </p>
                                        <h2 className="mt-2 font-bold">
                                            {product.name}
                                        </h2>
                                        <p className="mt-2 line-clamp-2 text-sm text-white/45">
                                            {product.short_description}
                                        </p>
                                        <div className="mt-5 flex items-center justify-between">
                                            <div>
                                                {product.promotional_price && (
                                                    <p className="text-xs text-white/30 line-through">
                                                        S/ {product.price}
                                                    </p>
                                                )}
                                                <p className="text-xl font-black">
                                                    S/{' '}
                                                    {product.promotional_price ??
                                                        product.price}
                                                </p>
                                            </div>
                                            <span className="flex size-10 items-center justify-center rounded-full bg-lime-400 text-black">
                                                <ShoppingCart className="size-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
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
        </>
    );
}
