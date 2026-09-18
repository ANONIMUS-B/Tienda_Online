import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Edit2,
    ExternalLink,
    Package,
    ShoppingBag,
    Upload,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { products } from '@/routes';
import type { Order } from '@/types/order';
import ReceiptFileInput from '@/components/receipt-file-input';

type PaginatedOrders = {
    data: Order[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
};

const paymentBadges: Record<string, { label: string; style: string }> = {
    pending: {
        label: 'Pago pendiente',
        style: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    paid: {
        label: 'Pagado ✓',
        style: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    rejected: {
        label: 'Pago rechazado ❌',
        style: 'border-red-200 bg-red-50 text-red-800',
    },
    failed: {
        label: 'Fallido',
        style: 'border-red-200 bg-red-50 text-red-800',
    },
};

const orderStatusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

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

export default function CustomerOrdersIndex({
    orders,
    companySettings,
}: {
    orders: PaginatedOrders;
    companySettings?: {
        yape_number?: string;
        yape_qr_path?: string | null;
        bank_name?: string | null;
        bank_account?: string | null;
        whatsapp_number?: string | null;
    };
}) {
    const flash = usePage().props.flash as { success?: string } | undefined;
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-50/60 text-slate-800">
            <style>{`
                .yape-pure-white, .yape-pure-white *,
                .whatsapp-white-text, .whatsapp-white-text * {
                    color: #ffffff !important;
                }
            `}</style>
            <Head title="Mis Pedidos | JBTECHLINE" />
            <main className="mx-auto max-w-5xl px-5 pt-32 pb-20 sm:pt-36">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[.2em] text-cyan-600 uppercase">
                            Mi cuenta
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                            Mis Pedidos
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Historial de compras, estado del envío y confirmación de pagos en un solo lugar.
                        </p>
                    </div>
                    <Link
                        href={products()}
                        className="self-start rounded-full bg-cyan-500 hover:bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition"
                    >
                        Explorar catálogo
                    </Link>
                </div>

                {flash?.success && (
                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2 shadow-xs">
                        <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="mt-8 grid gap-6">
                    {orders.data.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <ShoppingBag className="mx-auto size-12 text-slate-300" />
                            <h2 className="mt-4 text-xl font-bold text-slate-800">
                                Aún no tienes pedidos registrados
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                                Cuando realices una compra en la tienda, aparecerá aquí para que puedas hacerle seguimiento y adjuntar tus comprobantes de pago directamente.
                            </p>
                            <Link
                                href={products()}
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 hover:bg-cyan-600 px-6 py-3 font-bold text-white shadow transition"
                            >
                                Ver productos <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    ) : (
                        orders.data.map((order) => {
                            const pBadge =
                                paymentBadges[order.payment_status] ?? {
                                    label: order.payment_status,
                                    style: 'border-slate-200 bg-slate-100 text-slate-700',
                                };
                            const isPendingPayment =
                                order.payment_status === 'pending';
                            const hasProof = Boolean(
                                order.payment_reference || order.payment_receipt_path,
                            );
                            const isFormOpen =
                                isPendingPayment &&
                                (!hasProof || editingOrderId === order.id);

                            return (
                                <article
                                    key={order.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-5">
                                        <div>
                                            <span className="text-xs text-slate-500 font-medium">
                                                N° de pedido
                                            </span>
                                            <p className="font-mono text-lg font-bold text-slate-900">
                                                {order.number}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-bold ${pBadge.style}`}
                                            >
                                                {pBadge.label}
                                            </span>
                                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                                {orderStatusLabels[order.status] ??
                                                    order.status}
                                            </span>
                                        </div>
                                    </header>

                                    <div className="p-5 sm:p-6">
                                        <div className="grid gap-2.5 text-sm">
                                            {order.items?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between text-slate-700"
                                                >
                                                    <span>
                                                        {item.name} ×{' '}
                                                        <strong className="text-slate-900">
                                                            {item.quantity}
                                                        </strong>
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        S/ {item.total}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                            <span className="text-xs text-slate-500">
                                                Método de pago:{' '}
                                                <strong className="text-slate-800">
                                                    {order.payment_method === 'yape'
                                                        ? 'Yape / Plin'
                                                        : order.payment_method === 'bank_transfer'
                                                          ? 'Transferencia bancaria'
                                                          : order.payment_method}
                                                </strong>
                                            </span>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-500 block">
                                                    Total
                                                </span>
                                                <span className="text-xl font-black text-cyan-600">
                                                    S/ {order.total}
                                                </span>
                                            </div>
                                        </div>

                                        {/* INLINE PAYMENT PROOF MANAGEMENT (DIRECTLY IN MIS PEDIDOS) */}
                                        {isPendingPayment && ['yape', 'bank_transfer'].includes(order.payment_method) && (
                                            <div className="mt-5">
                                                {/* Summary banner when proof is already recorded and form is not open */}
                                                {!isFormOpen && hasProof && (
                                                    <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="grid size-11 place-items-center rounded-xl bg-purple-100 text-purple-700 shrink-0">
                                                                <CheckCircle2 className="size-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-purple-950">
                                                                    Pago registrado · Pendiente de aprobación
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-xs text-slate-600">
                                                                    {order.payment_reference && (
                                                                        <span>
                                                                            N° Operación:{' '}
                                                                            <strong className="font-mono text-purple-700 font-bold">
                                                                                {order.payment_reference}
                                                                            </strong>
                                                                        </span>
                                                                    )}
                                                                    {order.payment_receipt_path && (
                                                                        <a
                                                                            href={order.payment_receipt_path.startsWith('/') ? order.payment_receipt_path : `/storage/${order.payment_receipt_path}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-1 font-bold text-cyan-600 hover:text-cyan-700 hover:underline"
                                                                        >
                                                                            Ver foto adjunta <ExternalLink className="size-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                            <a
                                                                href={getWhatsAppOrderUrl(order, companySettings?.whatsapp_number)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="whatsapp-white-text inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                                                                style={{ color: '#ffffff' }}
                                                            >
                                                                <WhatsAppIcon className="size-3.5 shrink-0" />
                                                                <span>Confirmar por WhatsApp</span>
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingOrderId(order.id)}
                                                                className="yape-pure-white rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-[0.98] px-4 py-2.5 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                <Edit2 className="size-3.5 shrink-0" />
                                                                <span>Actualizar comprobante</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Inline form right here on the card */}
                                                {isFormOpen && (
                                                    <Form
                                                        action={`/pedido/${order.number}/registrar-pago`}
                                                        method="post"
                                                        className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 shadow-xs grid gap-4"
                                                    >
                                                        {({ errors, processing }) => (
                                                            <>
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-200/80 pb-3">
                                                                    <div>
                                                                        <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                                                                            {order.payment_method === 'yape'
                                                                                ? 'PAGO CON YAPE / PLIN'
                                                                                : 'TRANSFERENCIA BANCARIA'}
                                                                        </span>
                                                                        <h3 className="mt-1 text-sm font-bold text-purple-950">
                                                                            {hasProof
                                                                                ? 'Actualizar N° de Operación y Comprobante'
                                                                                : 'Registrar N° de Operación y Comprobante'}
                                                                        </h3>
                                                                        <p className="text-xs text-slate-600">
                                                                            Yapear al número:{' '}
                                                                            <strong className="text-purple-700 font-extrabold text-sm">
                                                                                {companySettings?.yape_number || '925523419'}
                                                                            </strong>
                                                                        </p>
                                                                    </div>
                                                                    {companySettings?.yape_qr_path && (
                                                                        <img
                                                                            src={`/storage/${companySettings.yape_qr_path}`}
                                                                            alt="QR Yape"
                                                                            className="size-16 rounded-lg bg-white p-1 object-contain border border-slate-200 shadow-xs"
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="grid gap-4 sm:grid-cols-2 items-end">
                                                                    <div>
                                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                                            N° de Operación Yape
                                                                        </label>
                                                                        <input
                                                                            name="payment_reference"
                                                                            defaultValue={order.payment_reference ?? ''}
                                                                            placeholder="Ej: 849201"
                                                                            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-purple-500 text-sm text-slate-900 placeholder:text-slate-400"
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

                                                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-200/80">
                                                                    <a
                                                                        href={getWhatsAppOrderUrl(order, companySettings?.whatsapp_number)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="whatsapp-white-text inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                                                                        style={{ color: '#ffffff' }}
                                                                    >
                                                                        <WhatsAppIcon className="size-3.5 shrink-0" />
                                                                        <span>Confirmar por WhatsApp</span>
                                                                    </a>
                                                                    <div className="flex items-center gap-2">
                                                                        {hasProof && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingOrderId(null)}
                                                                                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                                                            >
                                                                                Cancelar
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            disabled={processing}
                                                                            className="yape-pure-white inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-[0.98] px-6 py-2.5 text-xs font-bold shadow-md shadow-purple-950/10 transition-all disabled:opacity-50 cursor-pointer"
                                                                        >
                                                                            <Upload className="size-3.5 shrink-0" />
                                                                            <span>
                                                                                {processing ? 'Guardando…' : 'Guardar comprobante'}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </Form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
