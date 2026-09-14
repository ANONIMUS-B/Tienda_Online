import { Form, Head } from '@inertiajs/react';
import { MessageCircle, Wrench } from 'lucide-react';

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
    created_at: string;
    user: { name: string; email: string };
};

export default function AdminServiceRequests({
    requests,
    currentTeam,
}: {
    requests: { data: ServiceRequest[] };
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Solicitudes de servicio" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Solicitudes de servicio
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Revisa problemas técnicos y responde al cliente.
                    </p>
                </div>
                <div className="grid gap-5">
                    {requests.data.length === 0 && (
                        <div className="bg-card text-muted-foreground rounded-xl border p-12 text-center">
                            <Wrench className="mx-auto mb-3 size-10" /> No hay
                            solicitudes pendientes.
                        </div>
                    )}
                    {requests.data.map((request) => (
                        <article
                            key={request.id}
                            className="bg-card grid gap-5 rounded-xl border p-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-cyan-600">
                                        {request.number}
                                    </span>
                                    <span className="bg-muted rounded-full px-2.5 py-1 text-xs">
                                        {request.priority === 'urgent'
                                            ? 'Urgente'
                                            : 'Normal'}
                                    </span>
                                </div>
                                <h2 className="mt-3 text-lg font-bold">
                                    {request.service_type}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {request.device || 'Equipo no indicado'}
                                </p>
                                <div className="mt-4 grid gap-1 text-sm">
                                    <p>
                                        <strong>Cliente:</strong>{' '}
                                        {request.user.name}
                                    </p>
                                    <p>
                                        <strong>Correo:</strong>{' '}
                                        {request.user.email}
                                    </p>
                                    <p>
                                        <strong>Teléfono:</strong>{' '}
                                        {request.phone}
                                    </p>
                                </div>
                                <div className="bg-muted/50 mt-4 rounded-lg p-4 text-sm leading-6">
                                    {request.description}
                                </div>
                            </div>
                            <Form
                                action={`/${currentTeam.slug}/administracion/solicitudes-servicio/${request.id}`}
                                method="put"
                                className="grid content-start gap-3"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <label className="grid gap-1.5 text-sm font-medium">
                                            Estado
                                            <select
                                                name="status"
                                                defaultValue={request.status}
                                                className="bg-background h-10 rounded-md border px-3"
                                            >
                                                <option value="pending">
                                                    Pendiente
                                                </option>
                                                <option value="in_review">
                                                    En revisión
                                                </option>
                                                <option value="waiting_customer">
                                                    Esperando al cliente
                                                </option>
                                                <option value="resolved">
                                                    Resuelto
                                                </option>
                                                <option value="closed">
                                                    Cerrado
                                                </option>
                                            </select>
                                        </label>
                                        <label className="grid gap-1.5 text-sm font-medium">
                                            Respuesta para el cliente
                                            <textarea
                                                name="admin_response"
                                                required
                                                minLength={5}
                                                defaultValue={
                                                    request.admin_response ?? ''
                                                }
                                                rows={6}
                                                className="bg-background rounded-md border p-3 font-normal"
                                                placeholder="Explica el diagnóstico, próximos pasos, costo estimado o información requerida..."
                                            />
                                        </label>
                                        {errors.admin_response && (
                                            <p className="text-destructive text-sm">
                                                {errors.admin_response}
                                            </p>
                                        )}
                                        <button
                                            disabled={processing}
                                            className="bg-primary text-primary-foreground inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 font-medium disabled:opacity-60"
                                        >
                                            <MessageCircle className="size-4" />{' '}
                                            {processing
                                                ? 'Enviando...'
                                                : 'Guardar y notificar'}
                                        </button>
                                    </>
                                )}
                            </Form>
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}
