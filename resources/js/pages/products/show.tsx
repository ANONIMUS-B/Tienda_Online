import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, MessageCircle, ShoppingCart } from 'lucide-react';
import { home, products } from '@/routes';
import type { Product } from '@/types/product';
import PublicHeader from '@/components/public-header';
import { store as addToCart } from '@/routes/cart';
export default function ProductShow({ product }: { product: Product }) {
    const price = product.promotional_price ?? product.price;
    return (
        <>
            <Head title={`${product.name} | JBTECHLINE`} />
            <div className="min-h-screen bg-[#050806] text-white">
                <div className="hidden">
                    <header className="border-b border-white/10">
                        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
                            <Link href={home()} className="text-xl font-black">
                                JB
                                <span className="text-lime-400">TECHLINE</span>
                            </Link>
                            <Link
                                href={products()}
                                className="text-sm text-white/60"
                            >
                                Ver catálogo
                            </Link>
                        </div>
                    </header>
                </div>
                <PublicHeader />
                <main className="mx-auto max-w-7xl px-5 pt-28 pb-12">
                    <Link
                        href={products()}
                        className="inline-flex items-center gap-2 text-sm text-white/50"
                    >
                        <ArrowLeft className="size-4" />
                        Volver a productos
                    </Link>
                    <div className="mt-8 grid gap-12 lg:grid-cols-2">
                        <div>
                            <div className="aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                                {product.images[0] && (
                                    <img
                                        src={product.images[0].path}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="mt-4 grid grid-cols-5 gap-3">
                                {product.images.slice(1).map((image) => (
                                    <img
                                        key={image.id}
                                        src={image.path}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="aspect-square rounded-xl border border-white/10 object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="py-4">
                            <p className="text-sm font-bold text-lime-400">
                                {product.brand?.name} · {product.category?.name}
                            </p>
                            <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                                {product.name}
                            </h1>
                            <p className="mt-5 text-lg leading-8 text-white/55">
                                {product.short_description}
                            </p>
                            <div className="mt-7">
                                {product.promotional_price && (
                                    <p className="text-white/35 line-through">
                                        S/ {product.price}
                                    </p>
                                )}
                                <p className="text-4xl font-black">
                                    S/ {price}
                                </p>
                            </div>
                            <p
                                className={`mt-5 inline-flex rounded-full px-3 py-1 text-sm ${product.stock > 0 ? 'bg-lime-400/10 text-lime-400' : 'bg-red-400/10 text-red-300'}`}
                            >
                                {product.stock > 0
                                    ? product.stock <= product.minimum_stock
                                        ? 'Últimas unidades'
                                        : 'Disponible'
                                    : 'Agotado'}
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Form
                                    {...addToCart.form()}
                                    className="contents"
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
                                        disabled={product.stock < 1}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-4 font-bold text-black disabled:opacity-40"
                                    >
                                        <ShoppingCart className="size-5" />
                                        Agregar al carrito
                                    </button>
                                </Form>
                                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 font-bold">
                                    <MessageCircle className="size-5" />
                                    Consultar
                                </button>
                            </div>
                            <div className="mt-10 border-t border-white/10 pt-8">
                                <h2 className="text-xl font-bold">
                                    Descripción
                                </h2>
                                <p className="mt-4 leading-7 whitespace-pre-line text-white/50">
                                    {product.description}
                                </p>
                                {product.specifications && (
                                    <div className="mt-8 grid gap-2">
                                        {Object.entries(
                                            product.specifications,
                                        ).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex justify-between gap-5 rounded-xl bg-white/[.04] px-4 py-3 text-sm"
                                            >
                                                <span className="text-white/45">
                                                    {key}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Check className="size-4 text-lime-400" />
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
