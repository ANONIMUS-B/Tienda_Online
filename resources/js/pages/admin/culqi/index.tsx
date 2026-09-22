import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { paymentLabels, type PaymentAttempt } from '@/components/culqi-payment';
import { index, update, refund } from '@/routes/admin/culqi';
import { edit } from '@/routes/admin/company-settings';
import { show } from '@/routes/admin/orders';

type Payment = PaymentAttempt & {
    order: { id: number; number: string; customer_name: string };
};
export default function CulqiPayments({
    payments,
    filters,
    currentTeam,
}: {
    payments: {
        data: Payment[];
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { search?: string; status?: string };
    currentTeam: { slug: string };
}) {
    return (
        <div className="grid gap-6 p-4 md:p-8">
            <Head title="Pagos Culqi" />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Pagos Culqi</h1>
                    <p className="text-muted-foreground text-sm">
                        Cobros, confirmaciones y devoluciones de pedidos.
                    </p>
                </div>
                <Link
                    href={edit(currentTeam.slug)}
                    className="text-sm underline"
                >
                    Configurar Culqi
                </Link>
            </div>
            <Form
                {...index.form(currentTeam.slug)}
                className="flex flex-wrap gap-3"
            >
                <input
                    name="search"
                    aria-label="Número de pedido"
                    placeholder="Buscar pedido"
                    defaultValue={filters.search}
                    className="rounded-md border px-3 py-2"
                />
                <select
                    name="status"
                    aria-label="Estado de pago"
                    defaultValue={filters.status ?? ''}
                    className="rounded-md border px-3 py-2"
                >
                    <option value="">Todos los estados</option>
                    {Object.entries(paymentLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                <Button variant="outline">Filtrar</Button>
            </Form>
            {payments.data.length === 0 && (
                <p className="text-muted-foreground rounded-xl border p-8">
                    Todavía no hay operaciones con estos filtros.
                </p>
            )}
            {payments.data.map((payment) => (
                <article
                    key={payment.id}
                    className="bg-card grid gap-4 rounded-xl border p-5"
                >
                    <div className="flex flex-wrap justify-between gap-3">
                        <div>
                            <Link
                                href={show([
                                    currentTeam.slug,
                                    payment.order.id,
                                ])}
                                className="font-semibold underline"
                            >
                                {payment.order.number}
                            </Link>
                            <p className="text-muted-foreground text-sm">
                                {payment.order.customer_name}
                            </p>
                        </div>
                        <div className="text-right">
                            <b>S/ {(payment.amount / 100).toFixed(2)}</b>
                            <p className="text-sm">
                                {payment.environment === 'test'
                                    ? 'PRUEBAS · '
                                    : 'REAL · '}
                                {paymentLabels[payment.status]}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm">{payment.message}</p>
                    <p className="text-muted-foreground text-xs break-all">
                        Referencia: {payment.reference} · Cargo:{' '}
                        {payment.charge_id ?? 'Sin confirmar'} ·{' '}
                        {new Date(payment.created_at).toLocaleString('es-PE')}
                    </p>
                    <Form
                        {...update.form([currentTeam.slug, payment.id])}
                        className="flex flex-wrap items-start gap-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                {!payment.charge_id && (
                                    <label className="grid gap-1 text-xs">
                                        ID del cargo en CulqiPanel
                                        <input
                                            name="charge_id"
                                            placeholder="chr_live_… o chr_test_…"
                                            required
                                            className="rounded-md border px-3 py-2 text-sm"
                                        />
                                        <span>
                                            Se verificará el importe y que
                                            corresponda a este intento.
                                        </span>
                                    </label>
                                )}
                                <Button disabled={processing} variant="outline">
                                    {processing
                                        ? 'Verificando…'
                                        : 'Verificar con Culqi'}
                                </Button>
                                {Object.values(errors).map((error) => (
                                    <p
                                        className="text-sm text-red-600"
                                        key={error}
                                    >
                                        {error}
                                    </p>
                                ))}
                            </>
                        )}
                    </Form>
                    {['paid', 'test_paid'].includes(payment.status) && (
                        <details className="border-t pt-3">
                            <summary className="cursor-pointer text-sm">
                                Devolver el pago completo
                            </summary>
                            <Form
                                {...refund.form([currentTeam.slug, payment.id])}
                                className="mt-3 grid gap-3"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <p className="text-muted-foreground text-sm">
                                            Devuelve S/{' '}
                                            {(payment.amount / 100).toFixed(2)}{' '}
                                            al medio original. El plazo depende
                                            de Culqi y del banco. La devolución
                                            no cancela el pedido, repone stock
                                            ni anula comprobantes.
                                        </p>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                name="confirm"
                                                value="1"
                                                required
                                            />
                                            Confirmo la devolución total de este
                                            pago
                                            {payment.environment === 'test'
                                                ? ' de prueba'
                                                : ' real'}
                                            .
                                        </label>
                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            className="w-fit"
                                        >
                                            Solicitar devolución
                                        </Button>
                                        {Object.values(errors).map((error) => (
                                            <p
                                                key={error}
                                                className="text-sm text-red-600"
                                            >
                                                {error}
                                            </p>
                                        ))}
                                    </>
                                )}
                            </Form>
                        </details>
                    )}
                </article>
            ))}
            <div className="flex gap-4">
                {payments.prev_page_url && (
                    <Link href={payments.prev_page_url}>Anterior</Link>
                )}
                {payments.next_page_url && (
                    <Link href={payments.next_page_url}>Siguiente</Link>
                )}
            </div>
        </div>
    );
}
CulqiPayments.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Pagos Culqi', href: index(props.currentTeam.slug) },
    ],
});
