import { Form, Head, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    ExternalLink,
    FileCheck2,
    Mail,
    MessageCircle,
    Send,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminFormModal from '@/components/admin/admin-form-modal';
import { Button } from '@/components/ui/button';
import { index, update } from '@/routes/admin/orders';
import type { Order } from '@/types/order';
const receiptStatuses: Record<string, string> = {
    pending: 'Pendiente',
    issued: 'Emitido',
    accepted: 'Aceptado',
    sent: 'Enviado',
    rejected: 'Rechazado',
};

export default function OrderDetail({
    order,
    currentTeam,
}: {
    order: Order;
    currentTeam: { slug: string };
}) {
    const document = order.electronic_documents?.[0];
    const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [previewFormat, setPreviewFormat] = useState<
        'json' | 'html' | 'xml' | 'pdf' | null
    >(null);
    const previewUrl =
        document && previewFormat
            ? `/${currentTeam.slug}/administracion/facturacion/${document.id}/${previewFormat}`
            : '';
    const whatsappUrl = (
        usePage().props.flash as { whatsappUrl?: string | null } | undefined
    )?.whatsappUrl;
    useEffect(() => {
        if (whatsappUrl)
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, [whatsappUrl]);

    return (
        <>
            <Head title={order.number} />
            <AdminFormModal
                title={order.number}
                description={`${order.customer_name} · ${order.customer_email} · ${order.customer_phone}`}
                backHref={index(currentTeam.slug).url}
            >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="bg-card rounded-xl border p-5 md:p-6">
                        <h2 className="font-semibold">Productos</h2>
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between gap-4 border-b py-4"
                            >
                                <span>
                                    {item.name} × {item.quantity}
                                    <small className="text-muted-foreground block">
                                        {item.sku}
                                    </small>
                                </span>
                                <b>S/ {item.total}</b>
                            </div>
                        ))}
                        <div className="flex justify-between pt-5 text-xl font-bold">
                            <span>Total</span>
                            <span>S/ {order.total}</span>
                        </div>
                        <div className="bg-muted/40 mt-6 rounded-lg p-4 text-sm">
                            <strong>Entrega</strong>
                            <p className="text-muted-foreground mt-2">
                                {order.address}
                                <br />
                                {order.district}, {order.province}
                                <br />
                                {order.department}
                            </p>
                        </div>

                        <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-950/10 p-4 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <strong className="text-purple-300">
                                    Verificación de Pago ({order.payment_method === 'yape' ? 'Yape / Plin' : order.payment_method === 'bank_transfer' ? 'Transferencia' : order.payment_method})
                                </strong>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    order.payment_status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                    {order.payment_status === 'paid' ? 'Pago Aprobado ✓' : order.payment_status === 'rejected' ? 'Pago Rechazado ❌' : 'Pendiente'}
                                </span>
                            </div>

                            <div className="mt-3 grid gap-2">
                                <p className="text-muted-foreground">
                                    <strong>N° de Operación:</strong>{' '}
                                    <span className="font-mono font-bold text-foreground">{order.payment_reference || 'No ingresado'}</span>
                                </p>

                                {order.payment_receipt_path ? (
                                    <div className="mt-2">
                                        <p className="font-medium text-xs mb-1 text-muted-foreground">Comprobante adjunto:</p>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={order.payment_receipt_path.startsWith('/') ? order.payment_receipt_path : `/storage/${order.payment_receipt_path}`}
                                                alt="Comprobante de pago"
                                                className="max-h-56 rounded-lg border bg-black/40 object-contain p-1 transition cursor-pointer hover:opacity-85"
                                                onClick={() => setShowReceiptModal(true)}
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setShowReceiptModal(true)}
                                                className="font-semibold text-purple-400 hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="size-3" /> Ver en pantalla completa
                                            </button>
                                            <a
                                                href={order.payment_receipt_path.startsWith('/') ? order.payment_receipt_path : `/storage/${order.payment_receipt_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-semibold text-muted-foreground hover:underline"
                                            >
                                                Abrir en nueva pestaña
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">El cliente aún no ha adjuntado captura del comprobante.</p>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t">
                                <Form action={`/${currentTeam.slug}/administracion/pedidos/${order.id}/aprobar-pago`} method="post">
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            disabled={processing || order.payment_status === 'paid'}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                                        >
                                            <CheckCircle2 className="mr-1.5 size-4" />
                                            {order.payment_status === 'paid' ? 'Pago Aprobado' : 'Aprobar Pago Yape'}
                                        </Button>
                                    )}
                                </Form>
                                <Form action={`/${currentTeam.slug}/administracion/pedidos/${order.id}/rechazar-pago`} method="post">
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            disabled={processing || order.payment_status === 'rejected'}
                                            className="border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold text-xs"
                                        >
                                            <XCircle className="mr-1.5 size-4" />
                                            Rechazar Pago
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </section>
                    <aside className="grid content-start gap-5">
                        <Form
                            {...update.form({
                                current_team: currentTeam.slug,
                                order: order.id,
                            })}
                            className="bg-card grid gap-3 rounded-xl border p-5"
                        >
                            {({ processing }) => (
                                <>
                                    <h2 className="font-semibold">
                                        Seguimiento
                                    </h2>
                                    <select
                                        name="status"
                                        defaultValue={order.status}
                                        className="bg-background h-10 rounded-md border px-3"
                                    >
                                        <option value="pending">
                                            Pendiente
                                        </option>
                                        <option value="confirmed">
                                            Confirmado
                                        </option>
                                        <option value="preparing">
                                            Preparando
                                        </option>
                                        <option value="shipped">Enviado</option>
                                        <option value="delivered">
                                            Entregado
                                        </option>
                                        <option value="cancelled">
                                            Cancelado
                                        </option>
                                    </select>
                                    <select
                                        name="payment_status"
                                        value={paymentStatus}
                                        onChange={(event) =>
                                            setPaymentStatus(event.target.value)
                                        }
                                        className="bg-background h-10 rounded-md border px-3"
                                    >
                                        <option value="pending">
                                            Pago pendiente
                                        </option>
                                        <option value="paid">Pagado</option>
                                        <option value="failed">Fallido</option>
                                        <option value="refunded">
                                            Reembolsado
                                        </option>
                                    </select>
                                    <input
                                        type="hidden"
                                        name="receipt_type"
                                        value={order.receipt_type ?? 'boleta'}
                                    />
                                    <input
                                        type="hidden"
                                        name="receipt_status"
                                        value={
                                            order.receipt_status === 'draft'
                                                ? 'pending'
                                                : order.receipt_status
                                        }
                                    />
                                    <Button disabled={processing}>
                                        Guardar seguimiento
                                    </Button>
                                </>
                            )}
                        </Form>
                        <Form
                            action={`/${currentTeam.slug}/administracion/pedidos/${order.id}/${document ? 'compartir-comprobante' : 'emitir-comprobante'}`}
                            method="post"
                            className="bg-card grid gap-3 rounded-xl border p-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <h2 className="flex items-center gap-2 font-semibold">
                                        <FileCheck2 className="size-5" />{' '}
                                        Comprobante
                                    </h2>
                                    {document ? (
                                        <>
                                            <input
                                                type="hidden"
                                                name="receipt_type"
                                                value={document.type}
                                            />
                                            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
                                                <strong>
                                                    {document.number}
                                                </strong>
                                                <p>
                                                    Estado:{' '}
                                                    {receiptStatuses[
                                                        document.status
                                                    ] ?? document.status}
                                                </p>
                                                <p>
                                                    Total: S/ {document.total}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled
                                            >
                                                Comprobante ya emitido
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <label className="grid gap-1 text-sm font-medium">
                                                Tipo
                                                <select
                                                    name="receipt_type"
                                                    defaultValue={
                                                        order.receipt_type ??
                                                        'boleta'
                                                    }
                                                    className="bg-background h-10 rounded-md border px-3"
                                                >
                                                    <option value="boleta">
                                                        Boleta
                                                    </option>
                                                    <option value="factura">
                                                        Factura
                                                    </option>
                                                    <option value="sales_note">
                                                        Nota de venta
                                                    </option>
                                                </select>
                                            </label>
                                            <p className="text-muted-foreground text-xs">
                                                La serie y el correlativo se
                                                asignan automáticamente al
                                                emitir.
                                            </p>
                                        </>
                                    )}
                                    {document && (
                                        <div className="grid gap-2 text-sm">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="send_email"
                                                    value="1"
                                                    defaultChecked
                                                />
                                                <Mail className="size-4" />{' '}
                                                Enviar por correo
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="open_whatsapp"
                                                    value="1"
                                                />
                                                <MessageCircle className="size-4" />{' '}
                                                Abrir WhatsApp
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="send_system"
                                                    value="1"
                                                    disabled={!order.user_id}
                                                />
                                                <Send className="size-4" />{' '}
                                                Notificar en su cuenta{' '}
                                                {!order.user_id &&
                                                    '(no registrado)'}
                                            </label>
                                        </div>
                                    )}
                                    {errors.receipt_type && (
                                        <p className="text-destructive text-sm">
                                            {errors.receipt_type}
                                        </p>
                                    )}
                                    <Button
                                        disabled={
                                            processing ||
                                            (!document &&
                                                paymentStatus !== 'paid')
                                        }
                                    >
                                        {processing
                                            ? 'Procesando…'
                                            : document
                                              ? 'Compartir comprobante'
                                              : 'Emitir comprobante'}
                                    </Button>
                                    {document && (
                                        <p className="text-muted-foreground text-xs">
                                            Compartir lo envía al cliente; no
                                            vuelve a emitirlo ante SUNAT.
                                        </p>
                                    )}
                                    {paymentStatus !== 'paid' && !document && (
                                        <p className="text-xs text-amber-700">
                                            Selecciona “Pagado” y guarda el
                                            seguimiento.
                                        </p>
                                    )}
                                    {document && (
                                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                            {(
                                                [
                                                    'json',
                                                    'html',
                                                    'xml',
                                                    'pdf',
                                                ] as const
                                            ).map((format) => (
                                                <button
                                                    type="button"
                                                    key={format}
                                                    onClick={() =>
                                                        setPreviewFormat(format)
                                                    }
                                                    className="rounded-md border p-2 uppercase hover:border-cyan-400 hover:bg-cyan-50"
                                                >
                                                    {format}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </aside>
                </div>
                {document && previewFormat && (
                    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4">
                        <button
                            type="button"
                            className="absolute inset-0"
                            aria-label="Cerrar vista previa"
                            onClick={() => setPreviewFormat(null)}
                        />
                        <section
                            role="dialog"
                            aria-modal="true"
                            className="bg-background relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
                        >
                            <header className="flex items-start justify-between gap-4 border-b p-5">
                                <div>
                                    <p className="text-xs font-bold tracking-widest text-cyan-600 uppercase">
                                        Vista previa {previewFormat}
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold">
                                        {document.number} ·{' '}
                                        <span className="uppercase">
                                            {receiptStatuses[document.status] ??
                                                document.status}
                                        </span>
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPreviewFormat(null)}
                                    className="grid size-10 place-items-center rounded-full border"
                                >
                                    <X className="size-5" />
                                </button>
                            </header>
                            <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4">
                                {previewFormat === 'json' ? (
                                    <pre className="min-h-80 rounded-lg bg-slate-900 p-5 text-xs leading-6 break-words whitespace-pre-wrap text-cyan-100">
                                        {JSON.stringify(
                                            {
                                                document: {
                                                    number: document.number,
                                                    type: document.type,
                                                    status: document.status,
                                                },
                                                estado: document.status,
                                                payload: document.payload_json,
                                                provider_response:
                                                    document.response_json,
                                            },
                                            null,
                                            2,
                                        )}
                                    </pre>
                                ) : (
                                    <iframe
                                        title={`Vista previa ${previewFormat}`}
                                        src={previewUrl}
                                        className="h-[58vh] w-full rounded-lg bg-white"
                                    />
                                )}
                            </div>
                            <footer className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Cliente: {order.customer_name} · Total: S/{' '}
                                    {document.total}
                                </p>
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 font-semibold text-white"
                                >
                                    <Download className="size-4" /> Descargar /
                                    abrir
                                </a>
                            </footer>
                        </section>
                    </div>
                )}
                {showReceiptModal && order.payment_receipt_path && (
                    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm">
                        <button
                            type="button"
                            className="absolute inset-0"
                            aria-label="Cerrar comprobante"
                            onClick={() => setShowReceiptModal(false)}
                        />
                        <section
                            role="dialog"
                            aria-modal="true"
                            className="bg-background relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
                        >
                            <header className="flex items-center justify-between border-b p-4">
                                <h3 className="font-semibold text-lg">
                                    Comprobante de Pago — {order.number}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowReceiptModal(false)}
                                    className="grid size-9 place-items-center rounded-full border hover:bg-muted"
                                >
                                    <X className="size-5" />
                                </button>
                            </header>
                            <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-6 flex justify-center items-center">
                                <img
                                    src={order.payment_receipt_path.startsWith('/') ? order.payment_receipt_path : `/storage/${order.payment_receipt_path}`}
                                    alt="Comprobante completo"
                                    className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
                                />
                            </div>
                        </section>
                    </div>
                )}
            </AdminFormModal>
        </>
    );
}
