import { Form, Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Upload, ExternalLink } from 'lucide-react';
import { products } from '@/routes';
import type { Order } from '@/types/order';
import ReceiptFileInput from '@/components/receipt-file-input';

function WhatsAppIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.075-1.923-.464-.997-.417-1.636-1.428-1.686-1.494-.05-.067-.393-.523-.393-.998 0-.475.251-.708.34-.807.09-.099.196-.124.262-.124.066 0 .132 0 .188.005.06.003.14-.022.219.167.08.19.273.665.297.714.024.05.04.108.008.173-.032.067-.048.108-.096.166-.048.058-.102.13-.146.174-.049.049-.1.103-.043.202.057.099.255.421.547.681.376.335.693.44.791.489.099.049.157.041.215-.025.058-.066.248-.289.314-.388.066-.099.132-.083.223-.049.091.033.578.272.677.322.099.049.165.074.19.115.025.041.025.239-.119.644zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.661 1.436 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.002a7.96 7.96 0 01-4.06-1.112l-.291-.173-2.955.775.789-2.88-.19-.302A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8.002-8 8.002z" />
        </svg>
    );
}

function getWhatsAppOrderUrl(order: Order, whatsappNumber?: string | null) {
    const rawNumber = (whatsappNumber || '925523419').replace(/\D/g, '');
    const phone = rawNumber.length === 9 ? `51${rawNumber}` : rawNumber;

    const paymentMethodText =
        order.payment_method === 'yape'
            ? 'Yape'
            : order.payment_method === 'bank_transfer'
              ? 'Transferencia bancaria'
              : order.payment_method;

    const opText = order.payment_reference
        ? ` (Operación: ${order.payment_reference})`
        : '';

    const message = `Hola JBTECHLINE, acabo de realizar el pedido #${order.number} por S/ ${order.total} mediante ${paymentMethodText}${opText}. Adjunto mi comprobante para que lo validen.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

const field =
    'min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-purple-500 text-sm text-slate-900 placeholder:text-slate-400';

export default function OrderShow({
    order,
    companySettings,
}: {
    order: Order;
    companySettings?: {
        yape_number?: string;
        yape_qr_path?: string | null;
        bank_name?: string | null;
        bank_account?: string | null;
        whatsapp_number?: string | null;
    };
}) {
    const flash = usePage().props.flash as { success?: string } | undefined;

    const paymentBadges: Record<string, { label: string; style: string }> = {
        pending: {
            label: 'Pendiente de verificación',
            style: 'border-amber-200 bg-amber-50 text-amber-800',
        },
        paid: {
            label: 'Pago Verificado ✓',
            style: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        },
        rejected: {
            label: 'Pago Rechazado ❌',
            style: 'border-red-200 bg-red-50 text-red-800',
        },
        failed: {
            label: 'Fallido',
            style: 'border-red-200 bg-red-50 text-red-800',
        },
    };

    const currentBadge = paymentBadges[order.payment_status] ?? {
        label: order.payment_status,
        style: 'border-slate-200 bg-slate-100 text-slate-700',
    };

    return (
        <div className="min-h-screen bg-slate-50/60 text-slate-800">
            <style>{`
                .yape-pure-white, .yape-pure-white *,
                .whatsapp-white-text, .whatsapp-white-text * {
                    color: #ffffff !important;
                }
            `}</style>
            <Head title={`Pedido ${order.number}`} />
            <main className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:pt-36">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-sm">
                    <div className="flex items-center justify-between">
                        <CheckCircle2 className="size-14 text-cyan-500" />
                        <span
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold ${currentBadge.style}`}
                        >
                            {currentBadge.label}
                        </span>
                    </div>

                    <p className="mt-6 text-xs font-bold tracking-[.2em] text-cyan-600 uppercase">
                        Pedido registrado
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                        ¡Gracias por tu compra!
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Número de pedido:{' '}
                        <strong className="text-slate-800 font-mono">{order.number}</strong>.
                        Enviamos la confirmación a {order.customer_email}.
                    </p>

                    {flash?.success && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                            {flash.success}
                        </div>
                    )}

                    <div className="mt-8 grid gap-2.5">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm"
                            >
                                <span className="text-slate-700 font-medium">
                                    {item.name} × {item.quantity}
                                </span>
                                <span className="font-bold text-slate-900">S/ {item.total}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-5 text-2xl font-black">
                        <span className="text-slate-700">Total</span>
                        <span className="text-cyan-600">S/ {order.total}</span>
                    </div>

                    {/* Yape / Bank Payment Info Section */}
                    {['yape', 'bank_transfer'].includes(order.payment_method) && (
                        <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50/70 p-6 shadow-xs">
                            <h2 className="text-lg font-bold text-purple-950">
                                Información de Pago ({order.payment_method === 'yape' ? 'Yape / Plin' : 'Transferencia Bancaria'})
                            </h2>

                            {order.payment_status === 'pending' && (
                                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-xl bg-white p-4 border border-purple-200/80 shadow-xs">
                                    <div>
                                        <p className="text-sm font-semibold text-purple-900">
                                            Yapear al número:{' '}
                                            <strong className="text-purple-700 text-base font-extrabold">
                                                {companySettings?.yape_number || '925523419'}
                                            </strong>
                                        </p>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Una vez realizado el Yape, ingresa tu N° de operación o adjunta el comprobante a continuación para que despachemos tu pedido.
                                        </p>
                                    </div>
                                    {companySettings?.yape_qr_path && (
                                        <img
                                            src={`/storage/${companySettings.yape_qr_path}`}
                                            alt="QR Yape"
                                            className="size-24 rounded-lg bg-white p-1 object-contain border border-slate-200 shadow-xs"
                                        />
                                    )}
                                </div>
                            )}

                            {(order.payment_reference || order.payment_receipt_path) && (
                                <div className="mt-4 rounded-xl bg-white border border-purple-200/80 p-4 text-sm shadow-xs grid gap-2">
                                    {order.payment_reference && (
                                        <p className="text-slate-700">
                                            <strong className="text-slate-900">N° de Operación:</strong>{' '}
                                            <span className="font-mono font-bold text-purple-700">{order.payment_reference}</span>
                                        </p>
                                    )}
                                    {order.payment_receipt_path && (
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <strong className="text-slate-900">Comprobante enviado:</strong>
                                            <a
                                                href={order.payment_receipt_path.startsWith('/') ? order.payment_receipt_path : `/storage/${order.payment_receipt_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 font-bold text-cyan-600 hover:text-cyan-700 hover:underline"
                                            >
                                                Ver comprobante <ExternalLink className="size-3.5" />
                                            </a>
                                        </p>
                                    )}
                                    <div className="pt-2 border-t border-purple-200/60 mt-1">
                                        <a
                                            href={getWhatsAppOrderUrl(order, companySettings?.whatsapp_number)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="whatsapp-white-text inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
                                            style={{ color: '#ffffff' }}
                                        >
                                            <WhatsAppIcon className="size-3.5 shrink-0" />
                                            <span>Confirmar pedido por WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {order.payment_status === 'pending' && (
                                <Form
                                    action={`/pedido/${order.number}/registrar-pago`}
                                    method="post"
                                    className="mt-5 grid gap-4 border-t border-purple-200 pt-4"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                                                {order.payment_reference ? 'Actualizar datos de pago' : 'Registrar comprobante de pago'}
                                            </p>
                                            <div className="grid gap-4 sm:grid-cols-2 items-end">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                        N° de Operación Yape
                                                    </label>
                                                    <input
                                                        name="payment_reference"
                                                        defaultValue={order.payment_reference ?? ''}
                                                        placeholder="Ej: 849201"
                                                        className={field}
                                                    />
                                                    {errors.payment_reference && (
                                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                                            {errors.payment_reference}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <ReceiptFileInput
                                                        existingPath={order.payment_receipt_path}
                                                        accentColor="purple"
                                                        label="Foto del comprobante"
                                                    />
                                                    {errors.payment_receipt && (
                                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                                            {errors.payment_receipt}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                                <a
                                                    href={getWhatsAppOrderUrl(order, companySettings?.whatsapp_number)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="whatsapp-white-text inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] px-5 py-3 text-sm font-bold shadow-sm shadow-emerald-600/15 transition cursor-pointer"
                                                    style={{ color: '#ffffff' }}
                                                >
                                                    <WhatsAppIcon className="size-4 shrink-0" />
                                                    <span>Confirmar por WhatsApp</span>
                                                </a>
                                                <button
                                                    disabled={processing}
                                                    className="yape-pure-white inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-[0.98] px-6 py-3 text-sm font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Upload className="size-4 shrink-0" />
                                                    <span>{processing ? 'Enviando…' : 'Enviar datos de pago'}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            )}
                        </div>
                    )}

                    {order.receipt_url &&
                        ['issued', 'accepted', 'sent'].includes(
                            order.receipt_status,
                        ) && (
                            <a
                                href={order.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex rounded-full border border-cyan-500 px-7 py-3 font-bold text-cyan-600 hover:bg-cyan-50 transition"
                            >
                                Ver comprobante {order.receipt_type}
                            </a>
                        )}

                    <div className="mt-8">
                        <Link
                            href={products()}
                            className="inline-flex rounded-full bg-cyan-500 hover:bg-cyan-600 px-7 py-3 font-bold text-white shadow transition"
                        >
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
