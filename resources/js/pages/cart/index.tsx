import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Minus,
    PackageCheck,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Truck,
} from 'lucide-react';
import { login, products, register } from '@/routes';
import { destroy, update, whatsapp } from '@/routes/cart';
import { create as checkout } from '@/routes/checkout';

type CartItem = {
    id: number;
    slug: string;
    sku: string;
    name: string;
    short_description: string | null;
    brand: string | null;
    category: string | null;
    image: string | null;
    stock: number;
    quantity: number;
    unit_price: number;
    total: number;
};

export default function Cart({
    cart,
}: {
    cart: { items: CartItem[]; count: number; subtotal: number };
}) {
    const { auth } = usePage().props;

    return (
        <div className="bg-brand-background min-h-screen text-white">
            <Head title="Carrito | JBTECHLINE" />
            <main className="mx-auto max-w-6xl px-5 pt-24 pb-14 sm:pt-28">
                <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                    Tu compra
                </p>
                <h1 className="mt-3 text-4xl font-black">Carrito de compras</h1>
                {cart.items.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-white/10 p-10 text-center sm:p-16">
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
                    <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
                        <div className="grid gap-4">
                            {cart.items.map((item) => (
                                <article
                                    key={item.id}
                                    className="grid gap-4 rounded-3xl border border-cyan-200 bg-cyan-50/45 p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:p-5"
                                >
                                    <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-white sm:size-[120px]">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="size-full object-contain p-2"
                                            />
                                        ) : (
                                            <PackageCheck className="size-10 text-cyan-300" />
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-col justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-cyan-500">
                                                {[item.brand, item.category]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                            <h2 className="mt-1 text-lg font-black text-slate-800">
                                                {item.name}
                                            </h2>
                                            <p className="mt-1 text-xs text-slate-500">
                                                SKU: {item.sku}
                                            </p>
                                            {item.short_description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                    {item.short_description}
                                                </p>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                                <strong className="text-cyan-700">
                                                    Precio unitario: S/{' '}
                                                    {Number(
                                                        item.unit_price,
                                                    ).toFixed(2)}
                                                </strong>
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <CheckCircle2 className="size-3.5" />
                                                    {item.stock > 0
                                                        ? `${item.stock} disponibles`
                                                        : 'Agotado'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <Form
                                                    {...update.form(item.slug)}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="quantity"
                                                        value={Math.max(
                                                            1,
                                                            item.quantity - 1,
                                                        )}
                                                    />
                                                    <button
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                        aria-label={`Disminuir cantidad de ${item.name}`}
                                                        className="rounded-lg border border-cyan-200 bg-white p-2 text-cyan-700 disabled:opacity-30"
                                                    >
                                                        <Minus className="size-4" />
                                                    </button>
                                                </Form>
                                                <span className="w-8 text-center font-black text-slate-800">
                                                    {item.quantity}
                                                </span>
                                                <Form
                                                    {...update.form(item.slug)}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="quantity"
                                                        value={
                                                            item.quantity + 1
                                                        }
                                                    />
                                                    <button
                                                        disabled={
                                                            item.quantity >=
                                                            item.stock
                                                        }
                                                        aria-label={`Aumentar cantidad de ${item.name}`}
                                                        className="rounded-lg border border-cyan-200 bg-white p-2 text-cyan-700 disabled:opacity-30"
                                                    >
                                                        <Plus className="size-4" />
                                                    </button>
                                                </Form>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400">
                                                        Total
                                                    </p>
                                                    <strong className="text-lg text-cyan-700">
                                                        S/{' '}
                                                        {Number(
                                                            item.total,
                                                        ).toFixed(2)}
                                                    </strong>
                                                </div>
                                                <Form
                                                    {...destroy.form(item.slug)}
                                                >
                                                    <button
                                                        aria-label={`Eliminar ${item.name}`}
                                                        className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="size-5" />
                                                    </button>
                                                </Form>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <aside className="h-fit rounded-3xl border border-cyan-200 bg-cyan-50/55 p-6 lg:sticky lg:top-24">
                            <h2 className="text-xl font-black text-slate-800">
                                Resumen
                            </h2>
                            <div className="mt-6 flex justify-between text-sm text-slate-600">
                                <span>{cart.count} artículos</span>
                                <span>
                                    S/ {Number(cart.subtotal).toFixed(2)}
                                </span>
                            </div>
                            <div className="mt-5 flex justify-between border-t border-cyan-200 pt-5 text-xl font-black text-slate-800">
                                <span>Subtotal</span>
                                <span>
                                    S/ {Number(cart.subtotal).toFixed(2)}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                El costo de envío se calcula al finalizar.
                            </p>
                            <div className="mt-5 grid gap-3 border-y border-cyan-200 py-5 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                    <Truck className="size-4 text-cyan-500" />
                                    Envío o recojo según disponibilidad
                                </p>
                                <p className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-cyan-500" />
                                    Compra protegida y datos seguros
                                </p>
                            </div>
                            {auth.user ? (
                                <div className="mt-6 grid gap-3">
                                    {auth.user.role === 'user' && (
                                        <a
                                            href={whatsapp().url}
                                            className="flex justify-center rounded-full bg-emerald-500 px-6 py-4 font-black text-white"
                                        >
                                            Solicitar por WhatsApp
                                        </a>
                                    )}
                                    <Link
                                        href={checkout()}
                                        className="flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-4 font-black text-slate-950"
                                    >
                                        Finalizar compra{' '}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-6 grid gap-3">
                                    <p className="text-center text-sm text-slate-600">
                                        Ingresa o crea una cuenta para finalizar
                                        el pedido.
                                    </p>
                                    <Link
                                        href={login()}
                                        className="flex justify-center rounded-full bg-cyan-400 px-6 py-4 font-black text-slate-950"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="flex justify-center rounded-full border border-cyan-300 px-6 py-4 font-bold text-cyan-700"
                                    >
                                        Crear cuenta
                                    </Link>
                                </div>
                            )}
                            <Link
                                href={products()}
                                className="mt-5 block text-center text-sm font-bold text-cyan-700"
                            >
                                Seguir comprando
                            </Link>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
