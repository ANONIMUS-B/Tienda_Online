import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index, update } from '@/routes/admin/orders';
import type { Order } from '@/types/order';
export default function OrderDetail({
    order,
    currentTeam,
}: {
    order: Order;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title={order.number} />
            <div className="flex max-w-5xl flex-col gap-6 p-4 md:p-8">
                <Link
                    href={index(currentTeam.slug)}
                    className="text-muted-foreground inline-flex items-center gap-2 text-sm"
                >
                    <ArrowLeft className="size-4" />
                    Volver
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">{order.number}</h1>
                    <p className="text-muted-foreground">
                        {order.customer_name} · {order.customer_email} ·{' '}
                        {order.customer_phone}
                    </p>
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <section className="bg-card rounded-xl border p-6">
                        <h2 className="font-semibold">Productos</h2>
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between border-b py-4"
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
                    </section>
                    <aside className="grid h-fit gap-5">
                        <div className="bg-card rounded-xl border p-6">
                            <h2 className="font-semibold">Entrega</h2>
                            <p className="text-muted-foreground mt-3 text-sm">
                                {order.address}
                                <br />
                                {order.district}, {order.province}
                                <br />
                                {order.department}
                            </p>
                        </div>
                        <Form
                            {...update.form({
                                current_team: currentTeam.slug,
                                order: order.id,
                            })}
                            className="bg-card grid gap-4 rounded-xl border p-6"
                        >
                            {({ processing }) => (
                                <>
                                    <h2 className="font-semibold">
                                        Actualizar seguimiento
                                    </h2>
                                    <select
                                        name="status"
                                        defaultValue={order.status}
                                        className="rounded-md border bg-transparent p-2"
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
                                        defaultValue={order.payment_status}
                                        className="rounded-md border bg-transparent p-2"
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
                                    <Button disabled={processing}>
                                        Guardar cambios
                                    </Button>
                                </>
                            )}
                        </Form>
                    </aside>
                </div>
            </div>
        </>
    );
}
