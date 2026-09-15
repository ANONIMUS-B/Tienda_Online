import { Form, Head } from '@inertiajs/react';
import { Download, Eye, FileText, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Document = {
    id: number;
    number: string;
    type: string;
    status: string;
    environment: string;
    provider: string | null;
    customer_name: string;
    customer_document: string | null;
    customer_email: string | null;
    subtotal: string;
    tax: string;
    total: string;
    issued_at: string | null;
    created_at: string;
    payload_json: Record<string, unknown>;
    response_json: Record<string, unknown> | null;
    order?: { number: string } | null;
    service_request?: { number: string } | null;
    software_membership?: { id: number; plan: string } | null;
};
const labels: Record<string, string> = {
    boleta: 'Boleta',
    factura: 'Factura',
    sales_note: 'Nota de venta',
};
const statuses: Record<string, string> = {
    accepted: 'Aceptado',
    rejected: 'Rechazado',
    pending: 'Pendiente',
    issued: 'Emitido',
};
const plans: Record<string, string> = {
    monthly: 'Mensual',
    annual: 'Anual',
    permanent: 'Permanente',
};

export default function ElectronicBilling({
    settings,
    hasApiToken,
    hasCertificate,
    documents,
    currentTeam,
}: any) {
    const [preview, setPreview] = useState<{
        document: Document;
        format: 'json' | 'html' | 'xml' | 'cdr' | 'pdf';
    } | null>(null);
    const fileUrl = preview
        ? `/${currentTeam.slug}/administracion/facturacion/${preview.document.id}/${preview.format}`
        : '';
    const origin = (d: Document) =>
        d.order?.number ??
        d.service_request?.number ??
        (d.software_membership
            ? `Membresía #${d.software_membership.id} · ${plans[d.software_membership.plan] ?? d.software_membership.plan}`
            : 'Emisión manual');
    const json = preview
        ? {
              document: {
                  number: preview.document.number,
                  type: preview.document.type,
                  status: preview.document.status,
                  environment: preview.document.environment,
                  provider: preview.document.provider,
                  issued_at: preview.document.issued_at,
              },
              estado: preview.document.status,
              payload: preview.document.payload_json,
              provider_response: preview.document.response_json,
          }
        : {};
    return (
        <>
            <Head title="Facturación electrónica" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Facturación electrónica
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Productos, servicios y membresías en un solo registro.
                    </p>
                </div>
                <Form
                    method="put"
                    action={`/${currentTeam.slug}/administracion/facturacion`}
                    className="grid gap-5 xl:grid-cols-2"
                >
                    {({ processing }) => (
                        <>
                            <section className="bg-card grid gap-4 rounded-xl border p-5">
                                <h2 className="font-semibold">
                                    Configuración general
                                </h2>
                                <label className="flex items-center gap-2 rounded-lg border p-3">
                                    <input
                                        type="checkbox"
                                        name="billing_enabled"
                                        value="1"
                                        defaultChecked={
                                            settings.billing_enabled
                                        }
                                    />{' '}
                                    Activar envío electrónico
                                </label>
                                <label className="grid gap-1 text-sm">
                                    RUC emisor
                                    <input
                                        name="billing_ruc"
                                        defaultValue={
                                            settings.billing_ruc ?? ''
                                        }
                                        className="h-10 rounded-md border px-3"
                                    />
                                </label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-1 text-sm">
                                        Ambiente
                                        <select
                                            name="billing_environment"
                                            defaultValue={
                                                settings.billing_environment ??
                                                'demo'
                                            }
                                            className="h-10 rounded-md border px-3"
                                        >
                                            <option value="demo">
                                                Pruebas
                                            </option>
                                            <option value="production">
                                                Producción
                                            </option>
                                        </select>
                                    </label>
                                    <label className="grid gap-1 text-sm">
                                        Modalidad
                                        <select
                                            name="billing_mode"
                                            defaultValue={
                                                settings.billing_mode ?? 'api'
                                            }
                                            className="h-10 rounded-md border px-3"
                                        >
                                            <option value="api">
                                                API de PSE/OSE
                                            </option>
                                            <option value="certificate">
                                                Certificado propio
                                            </option>
                                        </select>
                                    </label>
                                </div>
                                <input
                                    type="hidden"
                                    name="billing_provider"
                                    value="apisunat"
                                />
                            </section>
                            <section className="bg-card grid gap-4 rounded-xl border p-5">
                                <h2 className="font-semibold">
                                    Credenciales APISUNAT
                                </h2>
                                <label className="grid gap-1 text-sm">
                                    URL API
                                    <input
                                        name="billing_api_url"
                                        defaultValue={
                                            settings.billing_api_url ??
                                            'https://sandbox.apisunat.pe'
                                        }
                                        className="h-10 rounded-md border px-3"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Token API
                                    <input
                                        type="password"
                                        name="billing_api_token"
                                        placeholder={
                                            hasApiToken
                                                ? 'Token guardado; vacío conserva el actual'
                                                : 'Token API'
                                        }
                                        className="h-10 rounded-md border px-3"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Certificado (.p12 o .pfx)
                                    <input
                                        type="file"
                                        name="billing_certificate"
                                        className="rounded-md border p-2"
                                    />
                                    <span className="text-muted-foreground text-xs">
                                        {hasCertificate
                                            ? 'Certificado guardado'
                                            : 'Sin certificado'}
                                    </span>
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Contraseña del certificado
                                    <input
                                        type="password"
                                        name="billing_certificate_password"
                                        className="h-10 rounded-md border px-3"
                                    />
                                </label>
                                <Button disabled={processing}>
                                    {processing
                                        ? 'Guardando…'
                                        : 'Guardar configuración'}
                                </Button>
                            </section>
                        </>
                    )}
                </Form>
                <section className="bg-card overflow-hidden rounded-xl border">
                    <header className="flex items-center gap-3 border-b p-5">
                        <FileText className="size-5 text-cyan-600" />
                        <div>
                            <h2 className="font-semibold">
                                Comprobantes emitidos
                            </h2>
                            <p className="text-muted-foreground text-xs">
                                Detalle tributario, origen y archivos.
                            </p>
                        </div>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px] text-left text-sm">
                            <thead className="bg-muted/40 text-xs uppercase">
                                <tr>
                                    {[
                                        'Documento',
                                        'Origen',
                                        'Cliente',
                                        'Subtotal',
                                        'IGV',
                                        'Total',
                                        'Estado',
                                        'Ambiente',
                                        'Fecha',
                                        'Archivos',
                                    ].map((x) => (
                                        <th key={x} className="p-4">
                                            {x}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {documents.data.map((d: Document) => (
                                    <tr
                                        key={d.id}
                                        className="hover:bg-muted/20 border-t align-top"
                                    >
                                        <td className="p-4">
                                            <strong>
                                                {labels[d.type] ?? d.type}
                                            </strong>
                                            <div className="font-medium text-cyan-600">
                                                {d.number}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">
                                            {origin(d)}
                                        </td>
                                        <td className="p-4">
                                            {d.customer_name}
                                            <div className="text-muted-foreground">
                                                {d.customer_document ||
                                                    'Sin documento'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {d.customer_email}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            S/ {Number(d.subtotal).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            S/ {Number(d.tax).toFixed(2)}
                                        </td>
                                        <td className="p-4 font-bold">
                                            S/ {Number(d.total).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs ${d.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                                            >
                                                {statuses[d.status] ?? d.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {d.environment === 'production'
                                                ? 'Producción'
                                                : 'Pruebas'}
                                            <div className="text-muted-foreground text-xs">
                                                {d.provider ?? 'Local'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {new Date(
                                                d.issued_at ?? d.created_at,
                                            ).toLocaleString('es-PE')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1.5">
                                                {(
                                                    [
                                                        'json',
                                                        'html',
                                                        'xml',
                                                        'cdr',
                                                        'pdf',
                                                    ] as const
                                                ).map((format) => (
                                                    <button
                                                        key={format}
                                                        type="button"
                                                        onClick={() =>
                                                            setPreview({
                                                                document: d,
                                                                format,
                                                            })
                                                        }
                                                        className={`inline-flex h-9 items-center gap-1 rounded-md border px-2 uppercase hover:bg-cyan-50 ${format === 'pdf' ? 'bg-cyan-500 text-white' : ''}`}
                                                    >
                                                        <Eye className="size-3.5" />
                                                        {format}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {documents.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-muted-foreground p-12 text-center"
                                        >
                                            Todavía no hay comprobantes
                                            emitidos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {preview && (
                <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
                    <button
                        type="button"
                        className="absolute inset-0"
                        aria-label="Cerrar"
                        onClick={() => setPreview(null)}
                    />
                    <section
                        role="dialog"
                        aria-modal="true"
                        className="bg-background relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
                    >
                        <header className="flex items-start justify-between border-b p-5">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-cyan-600 uppercase">
                                    Archivo {preview.format}
                                </p>
                                <h2 className="text-xl font-semibold">
                                    {preview.document.number}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {preview.document.customer_name} · S/{' '}
                                    {preview.document.total} ·{' '}
                                    {statuses[preview.document.status] ??
                                        preview.document.status}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreview(null)}
                                className="grid size-10 place-items-center rounded-full border"
                            >
                                <X className="size-5" />
                            </button>
                        </header>
                        <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4">
                            {preview.format === 'json' ? (
                                <pre className="min-h-[55vh] rounded-xl bg-slate-900 p-5 text-xs leading-6 break-words whitespace-pre-wrap text-cyan-100">
                                    {JSON.stringify(json, null, 2)}
                                </pre>
                            ) : (
                                <iframe
                                    title={`Vista previa ${preview.format}`}
                                    src={fileUrl}
                                    className="h-[62vh] w-full rounded-xl bg-white"
                                />
                            )}
                        </div>
                        <footer className="flex justify-end border-t p-4">
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-500 px-5 font-semibold text-white"
                            >
                                <Download className="size-4" /> Descargar /
                                abrir
                            </a>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
}
