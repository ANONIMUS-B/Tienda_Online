import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail } from 'lucide-react';
import { index } from '@/routes/admin/customers';
import { show as orderShow } from '@/routes/admin/orders';
import type { Order } from '@/types/order';
export default function Customer({
    customer,
    orders,
    currentTeam,
}: {
    customer: { id: number; name: string; email: string; created_at: string };
    orders: Order[];
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title={customer.name} />
            <div className="flex max-w-5xl flex-col gap-6 p-4 md:p-8">
                <Link
                    href={index(currentTeam.slug)}
                    className="text-muted-foreground inline-flex items-center gap-2 text-sm"
                >
                    <ArrowLeft className="size-4" />
                    Clientes
                </Link>
                <div className="bg-card rounded-xl border p-6">
                    <h1 className="text-2xl font-semibold">{customer.name}</h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        <Mail className="size-4" />
                        {customer.email}
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Cliente desde{' '}
                        {new Date(customer.created_at).toLocaleDateString(
                            'es-PE',
                        )}
                    </p>
                </div>
                <section className="bg-card rounded-xl border">
                    <h2 className="border-b p-5 font-semibold">
                        Historial de pedidos
                    </h2>
                    {orders.length === 0 ? (
                        <p className="text-muted-foreground p-8 text-center">
                            Todavía no tiene pedidos.
                        </p>
                    ) : (
                        orders.map((o) => (
                            <Link
                                key={o.id}
                                href={orderShow({
                                    current_team: currentTeam.slug,
                                    order: o.id,
                                })}
                                className="flex justify-between border-b p-5"
                            >
                                <span>
                                    <b>{o.number}</b>
                                    <small className="text-muted-foreground block">
                                        {o.status} · {o.payment_status}
                                    </small>
                                </span>
                                <strong>S/ {o.total}</strong>
                            </Link>
                        ))
                    )}
                </section>
            </div>
        </>
    );
}
