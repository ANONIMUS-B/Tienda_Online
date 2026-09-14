import { Form, Link } from '@inertiajs/react';
import { Download, ExternalLink, LockKeyhole, X } from 'lucide-react';
import { login, register } from '@/routes';
import { download } from '@/routes/programs';
import type { SoftwareProgram } from '@/types/software';

type Membership = {
    enabled: boolean;
    monthly_price: number;
    annual_price: number;
    yape_enabled: boolean;
    transfer_enabled: boolean;
    yape_number: string | null;
    bank_name: string | null;
    bank_account: string | null;
    active: boolean;
};

export default function ProgramDetailModal({
    program,
    membership,
    isAuthenticated,
    onClose,
}: {
    program: SoftwareProgram;
    membership: Membership;
    isAuthenticated: boolean;
    onClose: () => void;
}) {
    const steps =
        program.installation_instructions?.split('\n').filter(Boolean) ?? [];

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={program.name}
        >
            <button
                type="button"
                aria-label="Cerrar"
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white text-slate-700 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 rounded-full border border-cyan-100 bg-white p-2 text-slate-500"
                >
                    <X className="size-5" />
                </button>
                <div className="grid lg:grid-cols-[.9fr_1.1fr]">
                    <div className="flex min-h-64 items-center justify-center bg-cyan-50 p-6">
                        {program.image_url ? (
                            <img
                                src={program.image_url}
                                alt={program.name}
                                className="max-h-80 w-full object-contain"
                            />
                        ) : (
                            <Download className="size-20 text-cyan-300" />
                        )}
                    </div>
                    <div className="p-6 sm:p-8">
                        <p className="text-xs font-bold text-cyan-500 uppercase">
                            {program.category} · {program.platform} · v
                            {program.version}
                        </p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900">
                            {program.name}
                        </h2>
                        <p className="mt-3 leading-6 text-slate-600">
                            {program.description || program.short_description}
                        </p>

                        {program.requirements && (
                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                <h3 className="font-bold text-slate-900">
                                    Requisitos
                                </h3>
                                <p className="mt-2 text-sm whitespace-pre-line">
                                    {program.requirements}
                                </p>
                            </div>
                        )}
                        {steps.length > 0 && (
                            <div className="mt-5">
                                <h3 className="font-bold text-slate-900">
                                    Instalación
                                </h3>
                                <ol className="mt-3 grid gap-2">
                                    {steps.map((step, index) => (
                                        <li
                                            key={step}
                                            className="flex gap-3 text-sm"
                                        >
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700">
                                                {index + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        {program.tutorial_url && (
                            <a
                                href={program.tutorial_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 inline-flex items-center gap-2 font-bold text-cyan-600"
                            >
                                <ExternalLink className="size-4" /> Ver video
                                tutorial
                            </a>
                        )}

                        <div className="mt-6 border-t border-cyan-100 pt-5">
                            {program.can_download ? (
                                <a
                                    href={download(program.slug).url}
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 font-bold text-slate-900"
                                >
                                    <Download className="size-5" /> Descargar
                                    programa
                                </a>
                            ) : !isAuthenticated ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Link
                                        href={login()}
                                        className="rounded-xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-900"
                                    >
                                        Ingresar
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-xl border border-cyan-200 px-5 py-3 text-center font-bold"
                                    >
                                        Crear cuenta
                                    </Link>
                                </div>
                            ) : membership.enabled ? (
                                <Form
                                    action="/membresia-software"
                                    method="post"
                                    className="grid gap-3"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                                <LockKeyhole className="size-5 text-cyan-500" />{' '}
                                                Activar todas las descargas
                                            </div>
                                            <select
                                                name="plan"
                                                required
                                                className="h-11 rounded-xl border border-cyan-200 px-3"
                                            >
                                                <option value="monthly">
                                                    Mensual · S/{' '}
                                                    {membership.monthly_price.toFixed(
                                                        2,
                                                    )}
                                                </option>
                                                <option value="annual">
                                                    Anual · S/{' '}
                                                    {membership.annual_price.toFixed(
                                                        2,
                                                    )}
                                                </option>
                                            </select>
                                            <select
                                                name="payment_method"
                                                required
                                                className="h-11 rounded-xl border border-cyan-200 px-3"
                                            >
                                                {!membership.yape_enabled &&
                                                    !membership.transfer_enabled && (
                                                        <option value="">
                                                            Sin métodos de pago
                                                            disponibles
                                                        </option>
                                                    )}
                                                {membership.yape_enabled && (
                                                    <option value="yape">
                                                        Yape / Plin{' '}
                                                        {membership.yape_number
                                                            ? `· ${membership.yape_number}`
                                                            : ''}
                                                    </option>
                                                )}
                                                {membership.transfer_enabled && (
                                                    <option value="bank_transfer">
                                                        Transferencia{' '}
                                                        {membership.bank_name ??
                                                            ''}
                                                    </option>
                                                )}
                                            </select>
                                            <input
                                                name="payment_reference"
                                                required
                                                placeholder="Número de operación"
                                                className="h-11 rounded-xl border border-cyan-200 px-3"
                                            />
                                            {errors.payment_reference && (
                                                <p className="text-xs text-red-500">
                                                    {errors.payment_reference}
                                                </p>
                                            )}
                                            <button
                                                disabled={processing}
                                                className="h-12 rounded-xl bg-cyan-400 font-bold text-slate-900 disabled:opacity-60"
                                            >
                                                {processing
                                                    ? 'Enviando...'
                                                    : 'Solicitar activación'}
                                            </button>
                                            <p className="text-xs text-slate-500">
                                                El administrador verificará el
                                                pago y activará la membresía.
                                            </p>
                                        </>
                                    )}
                                </Form>
                            ) : (
                                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                                    La descarga requiere autorización. Contacta
                                    con JBTECHLINE.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
