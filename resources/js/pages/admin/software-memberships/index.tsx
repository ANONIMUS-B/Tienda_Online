import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Clock3 } from 'lucide-react';

type Membership = {
    id: number;
    plan: 'monthly' | 'annual' | 'permanent';
    amount: string;
    payment_method: string;
    payment_reference: string;
    status: string;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
    user: { name: string; email: string };
};

export default function MembershipsIndex({
    memberships,
    currentTeam,
}: {
    memberships: { data: Membership[] };
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Membresías de software" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Membresías de software
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Verifica pagos y activa las descargas.
                    </p>
                </div>
                <div className="grid gap-4">
                    {memberships.data.length === 0 && (
                        <div className="bg-card text-muted-foreground rounded-xl border p-12 text-center">
                            <Clock3 className="mx-auto mb-3 size-9" />
                            No hay solicitudes.
                        </div>
                    )}
                    {memberships.data.map((membership) => (
                        <article
                            key={membership.id}
                            className="bg-card grid gap-4 rounded-xl border p-5 md:grid-cols-[1fr_auto] md:items-center"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-bold">
                                        {membership.user.name}
                                    </h2>
                                    <span className="bg-muted rounded-full px-2 py-1 text-xs">
                                        {membership.plan === 'annual'
                                            ? 'Anual'
                                            : membership.plan === 'permanent'
                                              ? 'Permanente'
                                              : 'Mensual'}
                                    </span>
                                    <span className="bg-muted rounded-full px-2 py-1 text-xs">
                                        {membership.status}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {membership.user.email}
                                </p>
                                <p className="mt-3 text-sm">
                                    <strong>S/ {membership.amount}</strong> ·{' '}
                                    {membership.payment_method === 'yape'
                                        ? 'Yape / Plin'
                                        : 'Transferencia'}{' '}
                                    · Operación: {membership.payment_reference}
                                </p>
                                {membership.expires_at && (
                                    <p className="mt-1 text-xs text-emerald-600">
                                        Activa hasta{' '}
                                        {new Date(
                                            membership.expires_at,
                                        ).toLocaleDateString('es-PE')}
                                    </p>
                                )}
                                {membership.status === 'active' && membership.plan === 'permanent' && (
                                    <p className="mt-1 text-xs text-emerald-600">Acceso permanente, sin vencimiento</p>
                                )}
                            </div>
                            {membership.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Form
                                        action={`/${currentTeam.slug}/administracion/membresias-software/${membership.id}`}
                                        method="put"
                                    >
                                        <input
                                            type="hidden"
                                            name="status"
                                            value="active"
                                        />
                                        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-500 px-4 font-medium text-white">
                                            <CheckCircle2 className="size-4" />
                                            Activar
                                        </button>
                                    </Form>
                                    <Form
                                        action={`/${currentTeam.slug}/administracion/membresias-software/${membership.id}`}
                                        method="put"
                                    >
                                        <input
                                            type="hidden"
                                            name="status"
                                            value="rejected"
                                        />
                                        <button className="h-10 rounded-md border px-4 font-medium">
                                            Rechazar
                                        </button>
                                    </Form>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}
