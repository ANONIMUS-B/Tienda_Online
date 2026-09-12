import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { destroy, update } from '@/routes/cart';
import { whatsapp } from '@/routes/cart';
import { create as checkout } from '@/routes/checkout';
import { login, products, register } from '@/routes';
import type { CartItem } from '@/types/order';

export default function Cart({
    cart,
}: {
    cart: { items: CartItem[]; count: number; subtotal: number };
}) {
    const { auth } = usePage().props;
    return (
        <div className="min-h-screen bg-[#101a17] text-white">
            <Head title="Carrito | JBTECHLINE" />
            <main className="mx-auto max-w-6xl px-5 pt-32 pb-20">
                <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                    Tu compra
                </p>
                <h1 className="mt-3 text-4xl font-black">Carrito de compras</h1>
                {cart.items.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-white/10 p-16 text-center">
                        <ShoppingBag className="mx-auto size-12 text-lime-400" />
                        <p className="mt-5 text-white/55">
                            Tu carrito está vacío.
                        </p>
                        <Link
                            href={products()}
                            className="mt-6 inline-flex rounded-full bg-lime-400 px-7 py-3 font-bold text-black"
                        >
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
                        <div className="grid gap-4">
                            {cart.items.map(
                                ({ product, quantity, unit_price, total }) => (
                                    <article
                                        key={product.id}
                                        className="flex gap-5 rounded-3xl border border-white/10 bg-white/[.035] p-5"
                                    >
                                        <div className="size-28 overflow-hidden rounded-2xl bg-white/5">
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
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <p className="text-xs text-lime-400">
                                                    {product.sku}
                                                </p>
                                                <h2 className="mt-1 font-bold">
                                                    {product.name}
                                                </h2>
                                                <p className="mt-1 text-sm text-white/45">
                                                    S/{' '}
                                                    {Number(unit_price).toFixed(
                                                        2,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Form
                                                        {...update.form(
                                                            product.slug,
                                                        )}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="quantity"
                                                            value={Math.max(
                                                                1,
                                                                quantity - 1,
                                                            )}
                                                        />
                                                        <button
                                                            disabled={
                                                                quantity <= 1
                                                            }
                                                            className="rounded-lg border border-white/10 p-2 disabled:opacity-30"
                                                        >
                                                            <Minus className="size-4" />
                                                        </button>
                                                    </Form>
                                                    <span className="w-8 text-center font-bold">
                                                        {quantity}
                                                    </span>
                                                    <Form
                                                        {...update.form(
                                                            product.slug,
                                                        )}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="quantity"
                                                            value={quantity + 1}
                                                        />
                                                        <button
                                                            disabled={
                                                                quantity >=
                                                                product.stock
                                                            }
                                                            className="rounded-lg border border-white/10 p-2 disabled:opacity-30"
                                                        >
                                                            <Plus className="size-4" />
                                                        </button>
                                                    </Form>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <strong>
                                                        S/{' '}
                                                        {Number(total).toFixed(
                                                            2,
                                                        )}
                                                    </strong>
                                                    <Form
                                                        {...destroy.form(
                                                            product.slug,
                                                        )}
                                                    >
                                                        <button className="text-red-300">
                                                            <Trash2 className="size-5" />
                                                        </button>
                                                    </Form>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                        <aside className="h-fit rounded-3xl border border-lime-400/20 bg-white/[.04] p-7">
                            <h2 className="text-xl font-bold">Resumen</h2>
                            <div className="mt-6 flex justify-between text-white/55">
                                <span>{cart.count} artículos</span>
                                <span>
                                    S/ {Number(cart.subtotal).toFixed(2)}
                                </span>
                            </div>
                            <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-xl font-black">
                                <span>Subtotal</span>
                                <span>
                                    S/ {Number(cart.subtotal).toFixed(2)}
                                </span>
                            </div>
                            <p className="mt-3 text-xs text-white/35">
                                El envío se calcula al finalizar.
                            </p>
                            {auth.user ? (
                                <div className="mt-7 grid gap-3">
                                    {auth.user.role === 'user' && (
                                        <a
                                            href={whatsapp().url}
                                            className="flex justify-center rounded-full bg-[#25D366] px-6 py-4 font-black text-black"
                                        >
                                            Solicitar por WhatsApp
                                        </a>
                                    )}
                                    <Link
                                        href={checkout()}
                                        className="flex justify-center rounded-full border border-lime-400 px-6 py-4 font-black text-lime-400"
                                    >
                                        Finalizar compra
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-7 grid gap-3">
                                    <p className="text-center text-sm text-white/50">
                                        Debes ingresar o registrarte antes de
                                        realizar el pedido.
                                    </p>
                                    <Link
                                        href={login()}
                                        className="flex justify-center rounded-full bg-lime-400 px-6 py-4 font-black text-black"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="flex justify-center rounded-full border border-white/15 px-6 py-4 font-bold"
                                    >
                                        Crear cuenta
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
