import { Form, Head } from '@inertiajs/react';
import PublicHeader from '@/components/public-header';
import { store } from '@/routes/checkout';
import type { CartItem } from '@/types/order';

const field =
    'min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-lime-400/50';
export default function Checkout({
    items,
    subtotal,
}: {
    items: CartItem[];
    subtotal: number;
}) {
    return (
        <div className="min-h-screen bg-[#050806] text-white">
            <Head title="Finalizar compra | JBTECHLINE" />
            <PublicHeader />
            <main className="mx-auto max-w-6xl px-5 pt-32 pb-20">
                <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                    Paso final
                </p>
                <h1 className="mt-3 text-4xl font-black">Datos de compra</h1>
                <Form
                    {...store.form()}
                    className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"
                >
                    {({ errors, processing }) => (
                        <>
                            <section className="grid gap-5 rounded-3xl border border-white/10 bg-white/[.035] p-7 sm:grid-cols-2">
                                <h2 className="text-xl font-bold sm:col-span-2">
                                    Cliente y entrega
                                </h2>
                                <input
                                    name="customer_name"
                                    placeholder="Nombre completo"
                                    className={field}
                                />
                                <input
                                    type="email"
                                    name="customer_email"
                                    placeholder="Correo electrónico"
                                    className={field}
                                />
                                <input
                                    name="customer_phone"
                                    placeholder="Teléfono"
                                    className={field}
                                />
                                <input
                                    name="document_number"
                                    placeholder="DNI o RUC (opcional)"
                                    className={field}
                                />
                                <input
                                    name="address"
                                    placeholder="Dirección"
                                    className={`${field} sm:col-span-2`}
                                />
                                <input
                                    name="district"
                                    placeholder="Distrito"
                                    className={field}
                                />
                                <input
                                    name="province"
                                    placeholder="Provincia"
                                    className={field}
                                />
                                <input
                                    name="department"
                                    placeholder="Departamento"
                                    className={field}
                                />
                                <select
                                    name="shipping_method"
                                    className={field}
                                    defaultValue="delivery"
                                >
                                    <option value="delivery">
                                        Delivery — S/ 15.00
                                    </option>
                                    <option value="store_pickup">
                                        Recojo en tienda — Gratis
                                    </option>
                                </select>
                                <select
                                    name="payment_method"
                                    className={`${field} sm:col-span-2`}
                                    defaultValue="yape"
                                >
                                    <option value="yape">Yape / Plin</option>
                                    <option value="bank_transfer">
                                        Transferencia bancaria
                                    </option>
                                    <option value="cash_on_delivery">
                                        Pago contra entrega
                                    </option>
                                </select>
                                <textarea
                                    name="notes"
                                    placeholder="Indicaciones adicionales"
                                    className={`${field} min-h-28 py-3 sm:col-span-2`}
                                />
                                {Object.values(errors).length > 0 && (
                                    <p className="text-sm text-red-300 sm:col-span-2">
                                        Revisa los campos indicados:{' '}
                                        {Object.values(errors)[0]}
                                    </p>
                                )}
                            </section>
                            <aside className="h-fit rounded-3xl border border-lime-400/20 bg-white/[.04] p-7">
                                <h2 className="text-xl font-bold">Tu pedido</h2>
                                {items.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="mt-4 flex justify-between gap-4 text-sm"
                                    >
                                        <span className="text-white/55">
                                            {item.product.name} ×{' '}
                                            {item.quantity}
                                        </span>
                                        <span>
                                            S/ {Number(item.total).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-6 flex justify-between border-t border-white/10 pt-5 text-xl font-black">
                                    <span>Subtotal</span>
                                    <span>
                                        S/ {Number(subtotal).toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    disabled={processing}
                                    className="mt-7 w-full rounded-full bg-lime-400 px-6 py-4 font-black text-black disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Registrando…'
                                        : 'Confirmar pedido'}
                                </button>
                                <p className="mt-4 text-xs leading-5 text-white/35">
                                    El pago quedará pendiente hasta su
                                    verificación.
                                </p>
                            </aside>
                        </>
                    )}
                </Form>
            </main>
        </div>
    );
}
