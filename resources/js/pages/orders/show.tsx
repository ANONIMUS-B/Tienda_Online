import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { products } from '@/routes';
import type { Order } from '@/types/order';
export default function OrderShow({ order }: { order: Order }) {
    return (
        <div className="min-h-screen bg-[#101a17] text-white">
            <Head title={`Pedido ${order.number}`} />
            <main className="mx-auto max-w-3xl px-5 pt-36 pb-20">
                <div className="rounded-[2rem] border border-lime-400/25 bg-white/[.04] p-8 sm:p-12">
                    <CheckCircle2 className="size-14 text-lime-400" />
                    <p className="mt-6 text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                        Pedido recibido
                    </p>
                    <h1 className="mt-3 text-4xl font-black">
                        ¡Gracias por tu compra!
                    </h1>
                    <p className="mt-4 text-white/55">
                        Número:{' '}
                        <strong className="text-white">{order.number}</strong>.
                        Enviamos la confirmación a {order.customer_email}.
                    </p>
                    <div className="mt-8 grid gap-3">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between rounded-xl bg-black/25 p-4"
                            >
                                <span>
                                    {item.name} × {item.quantity}
                                </span>
                                <span>S/ {item.total}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-7 flex justify-between border-t border-white/10 pt-6 text-2xl font-black">
                        <span>Total</span>
                        <span>S/ {order.total}</span>
                    </div>
                    <p className="mt-3 text-sm text-amber-300">
                        Pago: pendiente de verificación.
                    </p>
                    <Link
                        href={products()}
                        className="mt-8 inline-flex rounded-full bg-lime-400 px-7 py-3 font-bold text-black"
                    >
                        Seguir comprando
                    </Link>
                </div>
            </main>
        </div>
    );
}
