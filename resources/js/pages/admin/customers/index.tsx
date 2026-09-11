import { Head, Link } from '@inertiajs/react';
import { Search, UserRound } from 'lucide-react';
import { index, show } from '@/routes/admin/customers';
type Customer = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    orders_count: number;
    orders_sum_total: string | null;
};
export default function Customers({
    customers,
    currentTeam,
    filters,
}: {
    customers: { data: Customer[] };
    currentTeam: { slug: string };
    filters: { q?: string };
}) {
    return (
        <>
            <Head title="Clientes" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-muted-foreground text-sm">
                        Usuarios registrados, pedidos y valor de compra.
                    </p>
                </div>
                <form
                    action={index(currentTeam.slug).url}
                    method="get"
                    className="relative max-w-lg"
                >
                    <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Buscar por nombre o correo"
                        className="w-full rounded-md border bg-transparent py-2 pr-3 pl-10"
                    />
                </form>
                <div className="bg-card overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b text-left">
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Registro</th>
                                <th className="p-4">Pedidos</th>
                                <th className="p-4">Total comprado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((c) => (
                                <tr key={c.id} className="border-b">
                                    <td className="p-4">
                                        <Link
                                            href={show({
                                                current_team: currentTeam.slug,
                                                customer: c.id,
                                            })}
                                            className="flex items-center gap-3 font-semibold"
                                        >
                                            <UserRound className="size-5" />
                                            <span>
                                                {c.name}
                                                <small className="text-muted-foreground block font-normal">
                                                    {c.email}
                                                </small>
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        {new Date(
                                            c.created_at,
                                        ).toLocaleDateString('es-PE')}
                                    </td>
                                    <td className="p-4">{c.orders_count}</td>
                                    <td className="p-4">
                                        S/{' '}
                                        {Number(
                                            c.orders_sum_total ?? 0,
                                        ).toFixed(2)}
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
Customers.layout = (p: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Clientes', href: index(p.currentTeam.slug) }],
});
