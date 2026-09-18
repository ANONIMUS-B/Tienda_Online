import { useState } from 'react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { store } from '@/routes/checkout';
import type { CartItem } from '@/types/order';
import { MessageCircle } from 'lucide-react';
import { register } from '@/routes';
import ReceiptFileInput from '@/components/receipt-file-input';

const field =
    'min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-lime-400/50';
export default function Checkout({
    items,
    subtotal,
    paymentMethods,
    whatsappUrl,
    companySettings,
}: {
    items: CartItem[];
    subtotal: number;
    paymentMethods: { value: string; label: string }[];
    whatsappUrl: string | null;
    companySettings?: {
        yape_number?: string;
        yape_qr_path?: string | null;
        bank_name?: string | null;
        bank_account?: string | null;
    };
}) {
    const { auth } = usePage().props;
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
        paymentMethods[0]?.value ?? 'yape',
    );
    return (
        <div className="bg-brand-background min-h-screen text-white">
            <Head title="Finalizar compra | JBTECHLINE" />
            <main className="mx-auto max-w-6xl px-5 pt-24 pb-14 sm:pt-28">
                <p className="text-xs font-bold tracking-[.2em] text-lime-400 uppercase">
                    Paso final
                </p>
                <h1 className="mt-3 text-4xl font-black">Datos de compra</h1>
                {!auth.user && (
                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-lime-400/25 bg-lime-400/[.06] p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-bold">
                                ¿Quieres guardar tus pedidos y acceder a
                                descargas?
                            </p>
                            <p className="mt-1 text-sm text-white/50">
                                Crea tu cuenta antes de confirmar. Tu carrito se
                                conservará.
                            </p>
                        </div>
                        <Link
                            href={register()}
                            className="shrink-0 rounded-full bg-lime-400 px-6 py-3 text-center font-bold text-black"
                        >
                            Crear cuenta
                        </Link>
                    </div>
                )}
                <Form
                    {...store.form()}
                    className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8"
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
                                    defaultValue={selectedPaymentMethod}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                >
                                    {paymentMethods.map((method) => (
                                        <option
                                            key={method.value}
                                            value={method.value}
                                        >
                                            {method.label}
                                        </option>
                                    ))}
                                </select>

                                {selectedPaymentMethod === 'yape' && (
                                    <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 sm:col-span-2 grid gap-4 shadow-xs">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                                                    YAPE / PLIN
                                                </span>
                                                <h3 className="mt-2 text-lg font-bold text-purple-950">Instrucciones de Pago</h3>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Realiza el Yape al número <strong className="text-purple-700 text-base font-extrabold">{companySettings?.yape_number || '925523419'}</strong>
                                                </p>
                                            </div>
                                            {companySettings?.yape_qr_path && (
                                                <div className="rounded-xl bg-white p-2 shrink-0 border border-slate-200 shadow-xs">
                                                    <img
                                                        src={`/storage/${companySettings.yape_qr_path}`}
                                                        alt="QR Yape"
                                                        className="size-32 object-contain rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-purple-200 items-end">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                    N° de Operación (opcional)
                                                </label>
                                                <input
                                                    name="payment_reference"
                                                    placeholder="Ej: 849201"
                                                    className={field}
                                                />
                                            </div>
                                            <div>
                                                <ReceiptFileInput accentColor="purple" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedPaymentMethod === 'bank_transfer' && (
                                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5 sm:col-span-2 grid gap-4 shadow-xs">
                                        <div>
                                            <span className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                                                TRANSFERENCIA BANCARIA
                                            </span>
                                            <h3 className="mt-2 text-lg font-bold text-cyan-950">Datos Bancarios</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Banco: <strong className="text-cyan-700">{companySettings?.bank_name || 'BCP / Interbank'}</strong>
                                            </p>
                                            {companySettings?.bank_account && (
                                                <p className="text-sm text-slate-600">
                                                    Cuenta: <strong className="text-cyan-700">{companySettings.bank_account}</strong>
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-cyan-200 items-end">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                    N° de Operación / Constancia
                                                </label>
                                                <input
                                                    name="payment_reference"
                                                    placeholder="Ej: 00492019"
                                                    className={field}
                                                />
                                            </div>
                                            <div>
                                                <ReceiptFileInput accentColor="cyan" label="Foto del voucher / comprobante (opcional)" />
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                {whatsappUrl && (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 px-6 py-4 font-bold text-emerald-300"
                                    >
                                        <MessageCircle className="size-5" />
                                        Comprar por WhatsApp
                                    </a>
                                )}
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
