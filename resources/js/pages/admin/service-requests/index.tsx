import { Form, Head } from '@inertiajs/react';
import { MessageCircle, Pencil, Wrench, X } from 'lucide-react';
import { useState } from 'react';

type ServiceRequest = {
    id: number;
    number: string;
    service_type: string;
    device: string | null;
    phone: string;
    priority: string;
    status: string;
    description: string;
    admin_response: string | null;
    quoted_amount: string | null;
    payment_status: string;
    receipt_type: string;
    user: { name: string; email: string; document_number: string | null };
    electronic_documents: { number: string; status: string; type: string }[];
};
const receiptStatuses: Record<string, string> = {
    pending: 'Pendiente',
    issued: 'Emitido',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
};

export default function AdminServiceRequests({
    requests,
    currentTeam,
    quoteMode = false,
}: {
    requests: { data: ServiceRequest[] };
    currentTeam: { slug: string };
    quoteMode?: boolean;
}) {
    const [selected, setSelected] = useState<ServiceRequest | null>(null);
    return (
        <>
            <Head
                title={
                    quoteMode
                        ? 'Cotizaciones de software'
                        : 'Solicitudes de servicio'
                }
            />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {quoteMode
                            ? 'Cotizaciones de software'
                            : 'Solicitudes de servicio'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Revisa y responde cada solicitud.
                    </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    {requests.data.length === 0 && (
                        <div className="bg-card text-muted-foreground col-span-full rounded-xl border p-12 text-center">
                            <Wrench className="mx-auto mb-3 size-10" /> No hay
                            solicitudes.
                        </div>
                    )}
                    {requests.data.map((request) => (
                        <article
                            key={request.id}
                            className="bg-card rounded-xl border p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="font-bold text-cyan-600">
                                        {request.number}
                                    </span>
                                    <h2 className="mt-2 text-lg font-bold">
                                        {request.service_type}
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        {request.user.name} ·{' '}
                                        {request.device ||
                                            'Sin equipo indicado'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelected(request)}
                                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                                >
                                    <Pencil className="size-4" /> Gestionar
                                </button>
                            </div>
                            <p className="bg-muted/50 mt-4 line-clamp-3 rounded-lg p-3 text-sm">
                                {request.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
            {selected && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-sm md:p-8">
                    <button
                        aria-label="Cerrar"
                        className="absolute inset-0"
                        onClick={() => setSelected(null)}
                    />
                    <section
                        role="dialog"
                        aria-modal="true"
                        className="bg-background relative mx-auto w-full max-w-3xl rounded-2xl border shadow-2xl"
                    >
                        <header className="flex items-start justify-between border-b p-5">
                            <div>
                                <strong className="text-cyan-600">
                                    {selected.number}
                                </strong>
                                <h2 className="text-xl font-semibold">
                                    {selected.service_type}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {selected.user.name} · {selected.user.email}{' '}
                                    · {selected.phone}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="grid size-10 place-items-center rounded-full border"
                            >
                                <X className="size-5" />
                            </button>
                        </header>
                        <div className="p-5">
                            <p className="bg-muted/50 mb-5 rounded-lg p-4 text-sm">
                                {selected.description}
                            </p>
                            <Form
                                action={`/${currentTeam.slug}/administracion/solicitudes-servicio/${selected.id}`}
                                method="put"
                                onSuccess={() => setSelected(null)}
                                className="grid gap-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <label className="grid gap-1 text-sm font-medium">
                                                Estado
                                                <select
                                                    name="status"
                                                    defaultValue={
                                                        selected.status
                                                    }
                                                    className="bg-background h-10 rounded-md border px-3"
                                                >
                                                    <option value="pending">
                                                        Pendiente
                                                    </option>
                                                    <option value="in_review">
                                                        En revisión
                                                    </option>
                                                    <option value="waiting_customer">
                                                        Esperando cliente
                                                    </option>
                                                    <option value="resolved">
                                                        Resuelto
                                                    </option>
                                                    <option value="closed">
                                                        Cerrado
                                                    </option>
                                                </select>
                                            </label>
                                            <label className="grid gap-1 text-sm font-medium">
                                                Importe (S/)
                                                <input
                                                    name="quoted_amount"
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    defaultValue={
                                                        selected.quoted_amount ??
                                                        ''
                                                    }
                                                    className="bg-background h-10 rounded-md border px-3"
                                                />
                                            </label>
                                            <label className="grid gap-1 text-sm font-medium">
                                                Pago
                                                <select
                                                    name="payment_status"
                                                    defaultValue={
                                                        selected.payment_status ??
                                                        'pending'
                                                    }
                                                    className="bg-background h-10 rounded-md border px-3"
                                                >
                                                    <option value="pending">
                                                        Pendiente
                                                    </option>
                                                    <option value="paid">
                                                        Pagado
                                                    </option>
                                                    <option value="refunded">
                                                        Reembolsado
                                                    </option>
                                                </select>
                                            </label>
                                            <label className="grid gap-1 text-sm font-medium">
                                                Comprobante
                                                <select
                                                    name="receipt_type"
                                                    defaultValue={
                                                        selected.receipt_type ??
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
                                                </select>
                                            </label>
                                        </div>
                                        <label className="grid gap-1 text-sm font-medium">
                                            Respuesta
                                            <textarea
                                                name="admin_response"
                                                required
                                                minLength={5}
                                                defaultValue={
                                                    selected.admin_response ??
                                                    ''
                                                }
                                                rows={6}
                                                className="bg-background rounded-md border p-3"
                                            />
                                        </label>
                                        {errors.admin_response && (
                                            <p className="text-destructive text-sm">
                                                {errors.admin_response}
                                            </p>
                                        )}
                                        <button
                                            disabled={processing}
                                            className="bg-primary text-primary-foreground inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 font-medium"
                                        >
                                            <MessageCircle className="size-4" />{' '}
                                            Guardar y notificar
                                        </button>
                                    </>
                                )}
                            </Form>
                            <div className="mt-5 border-t pt-5">
                                {selected.electronic_documents?.[0] ? (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                        <strong>
                                            {
                                                selected.electronic_documents[0]
                                                    .number
                                            }
                                        </strong>
                                        <p>
                                            Estado:{' '}
                                            {receiptStatuses[
                                                selected.electronic_documents[0]
                                                    .status
                                            ] ??
                                                selected.electronic_documents[0]
                                                    .status}
                                        </p>
                                    </div>
                                ) : (
                                    <Form
                                        action={`/${currentTeam.slug}/administracion/solicitudes-servicio/${selected.id}/emitir-comprobante`}
                                        method="post"
                                        className="grid gap-3 sm:grid-cols-[1fr_auto]"
                                    >
                                        <select
                                            name="receipt_type"
                                            defaultValue={
                                                selected.receipt_type ??
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
                                        </select>
                                        <button
                                            disabled={
                                                selected.payment_status !==
                                                    'paid' ||
                                                !selected.quoted_amount
                                            }
                                            className="h-10 rounded-md bg-cyan-500 px-5 font-semibold text-white disabled:opacity-50"
                                        >
                                            Emitir comprobante
                                        </button>
                                    </Form>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
