import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, Wrench } from 'lucide-react';
import { services } from '@/routes';

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
    responded_at: string | null;
    created_at: string;
};

const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    in_review: 'En revisión',
    waiting_customer: 'Esperando tu respuesta',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

export default function ServiceRequestsIndex({
    requests,
}: {
    requests: ServiceRequest[];
}) {
    return (
        <>
            <Head title="Mis solicitudes de servicio" />
            <main className="min-h-screen bg-white px-5 pt-28 pb-16 text-slate-700 sm:pt-32">
                <div className="mx-auto max-w-5xl">
                    <p className="text-xs font-bold tracking-[.2em] text-cyan-500 uppercase">
                        Soporte técnico
                    </p>
                    <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 sm:text-4xl">
                                Mis solicitudes
                            </h1>
                            <p className="mt-2 text-slate-500">
                                Consulta el estado y las respuestas del equipo
                                técnico.
                            </p>
                        </div>
                        <Link
                            href={services()}
                            className="rounded-xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-900"
                        >
                            Nueva solicitud
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-4">
                        {requests.length === 0 && (
                            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/50 p-12 text-center">
                                <Wrench className="mx-auto size-10 text-cyan-400" />
                                <h2 className="mt-4 font-bold text-slate-800">
                                    Aún no tienes solicitudes
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Describe el problema de tu equipo para
                                    recibir atención.
                                </p>
                            </div>
                        )}
                        {requests.map((request) => (
                            <article
                                key={request.id}
                                className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm sm:p-7"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-cyan-500">
                                            {request.number}
                                        </p>
                                        <h2 className="mt-1 text-xl font-black text-slate-800">
                                            {request.service_type}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {request.device ||
                                                'Equipo no especificado'}{' '}
                                            ·{' '}
                                            {new Date(
                                                request.created_at,
                                            ).toLocaleDateString('es-PE')}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                                        {statusLabels[request.status] ??
                                            request.status}
                                    </span>
                                </div>
                                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase">
                                        Tu consulta
                                    </p>
                                    <p className="mt-2 text-sm leading-6">
                                        {request.description}
                                    </p>
                                </div>
                                {request.admin_response ? (
                                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                        <div className="flex items-center gap-2 text-emerald-700">
                                            <CheckCircle2 className="size-4" />
                                            <p className="text-xs font-bold uppercase">
                                                Respuesta del administrador
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-700">
                                            {request.admin_response}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                                        <Clock3 className="size-4" /> Estamos
                                        revisando tu solicitud.
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
