import { Head, Link, usePage } from '@inertiajs/react';
import { Boxes, Package, ShoppingBag, Users } from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
    summary: { products: number; pendingOrders: number; customers: number; programs: number };
    recentOrders: Array<{ id: number; number: string; customer_name: string; status: string; total: string; created_at: string }>;
};

const statusLabels: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', processing: 'En proceso', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

export default function Dashboard({ pendingInvitations = [], summary, recentOrders }: Props) {
    const { currentTeam } = usePage().props as { currentTeam?: { slug: string } };
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const statistics = [
        { label: 'Productos', value: summary.products, icon: Package },
        { label: 'Pedidos pendientes', value: summary.pendingOrders, icon: ShoppingBag },
        { label: 'Clientes', value: summary.customers, icon: Users },
        { label: 'Software y programas', value: summary.programs, icon: Boxes },
    ];

    return (
        <>
            <Head title="Panel principal" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div><p className="text-sm text-muted-foreground">Resumen administrativo</p><h1 className="text-3xl font-bold tracking-tight">Bienvenido a JBTECHLINE</h1></div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statistics.map(({ label, value, icon: Icon }) => (
                        <article key={label} className="rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-5 text-lime-600" /></div>
                            <p className="mt-4 text-3xl font-black">{value}</p>
                        </article>
                    ))}
                </div>
                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b p-5">
                        <div>
                            <h2 className="text-lg font-bold">Pedidos recientes</h2>
                            <p className="text-sm text-muted-foreground">Últimas solicitudes recibidas desde la tienda.</p>
                        </div>
                        {currentTeam?.slug && (
                            <Link
                                href={`/${currentTeam.slug}/administracion/pedidos`}
                                className="text-sm font-semibold text-lime-600 hover:underline"
                            >
                                Ver todos →
                            </Link>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="p-4">Pedido</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-t">
                                        <td className="p-4 font-semibold">
                                            {currentTeam?.slug ? (
                                                <Link
                                                    href={`/${currentTeam.slug}/administracion/pedidos/${order.id}`}
                                                    className="text-lime-600 hover:underline font-mono"
                                                >
                                                    {order.number}
                                                </Link>
                                            ) : (
                                                order.number
                                            )}
                                        </td>
                                        <td className="p-4">{order.customer_name}</td>
                                        <td className="p-4">{statusLabels[order.status] ?? order.status}</td>
                                        <td className="p-4 text-right font-semibold">S/ {Number(order.total).toFixed(2)}</td>
                                        <td className="p-4 text-right">
                                            {currentTeam?.slug && (
                                                <Link
                                                    href={`/${currentTeam.slug}/administracion/pedidos/${order.id}`}
                                                    className="inline-flex items-center rounded-lg bg-lime-600/10 px-3 py-1 text-xs font-semibold text-lime-600 hover:bg-lime-600/20"
                                                >
                                                    Ver pedido
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentOrders.length === 0 && <p className="p-10 text-center text-muted-foreground">Todavía no hay pedidos registrados.</p>}
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Panel principal',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
