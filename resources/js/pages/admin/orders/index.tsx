import { Head, Link } from '@inertiajs/react';
import { Eye, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index, show } from '@/routes/admin/orders';
import type { Order } from '@/types/order';
const orderStatuses: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};
const paymentStatuses: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
};
const receiptStatuses: Record<string, string> = {
    pending: 'Pendiente',
    issued: 'Emitido',
    accepted: 'Aceptado',
    sent: 'Enviado',
    rejected: 'Rechazado',
};
export default function OrdersIndex({
    orders,
    currentTeam,
}: {
    orders: { data: Order[] };
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Pedidos" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">Pedidos</h1>
                    <p className="text-muted-foreground text-sm">
                        Ventas, pagos y seguimiento de entregas.
                    </p>
                </div>
                <div className="bg-card overflow-x-auto rounded-xl border">
                    <table className="w-full min-w-[1050px] text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b text-left">
                                <th className="p-4">Pedido</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Documento</th>
                                <th className="p-4">Artículos</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Entrega</th>
                                <th className="p-4">Pago</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Comprobante</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="text-muted-foreground p-12 text-center"
                                    >
                                        <ShoppingBag className="mx-auto mb-3 size-10" />
                                        No hay pedidos
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((order) => (
                                <tr key={order.id} className="border-b">
                                    <td className="p-4 font-semibold">
                                        {order.number}
                                    </td>
                                    <td className="p-4">
                                        {order.customer_name}
                                        <br />
                                        <span className="text-muted-foreground text-xs">
                                            {order.customer_email}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {order.document_number ||
                                            'Sin documento'}
                                    </td>
                                    <td className="p-4">
                                        {(
                                            order as Order & {
                                                items_count?: number;
                                            }
                                        ).items_count ?? 0}
                                    </td>
                                    <td className="p-4">S/ {order.total}</td>
                                    <td className="p-4">
                                        {order.shipping_method}
                                        <div className="text-muted-foreground text-xs">
                                            {order.district}, {order.province}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {paymentStatuses[
                                            order.payment_status
                                        ] ?? order.payment_status}
                                    </td>
                                    <td className="p-4">
                                        {orderStatuses[order.status] ??
                                            order.status}
                                    </td>
                                    <td className="p-4">
                                        {order.electronic_documents?.[0] ? (
                                            <>
                                                <strong>
                                                    {
                                                        order
                                                            .electronic_documents[0]
                                                            .number
                                                    }
                                                </strong>
                                                <div className="text-xs text-emerald-600">
                                                    {receiptStatuses[
                                                        order
                                                            .electronic_documents[0]
                                                            .status
                                                    ] ??
                                                        order
                                                            .electronic_documents[0]
                                                            .status}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Sin emitir
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={show({
                                                    current_team:
                                                        currentTeam.slug,
                                                    order: order.id,
                                                })}
                                            >
                                                <Eye />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
OrdersIndex.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Pedidos', href: index(props.currentTeam.slug) }],
});
