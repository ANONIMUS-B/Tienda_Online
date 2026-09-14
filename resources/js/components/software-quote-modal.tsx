import { Form, Link } from '@inertiajs/react';
import { Send, X } from 'lucide-react';
import { login } from '@/routes';

export default function SoftwareQuoteModal({
    isAuthenticated,
    onClose,
}: {
    isAuthenticated: boolean;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Cotizar software"
        >
            <button
                type="button"
                aria-label="Cerrar"
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 text-slate-700 shadow-2xl sm:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full border border-cyan-100 p-2"
                >
                    <X className="size-5" />
                </button>
                <p className="text-xs font-bold tracking-widest text-cyan-500 uppercase">
                    Desarrollo personalizado
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                    Cotizar software
                </h2>
                {isAuthenticated ? (
                    <Form
                        action="/solicitudes-servicio"
                        method="post"
                        resetOnSuccess
                        onSuccess={onClose}
                        className="mt-6 grid gap-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="service_type"
                                    value="Desarrollo de software"
                                />
                                <input
                                    type="hidden"
                                    name="priority"
                                    value="normal"
                                />
                                <input
                                    name="device"
                                    placeholder="Tipo de sistema: web, móvil, ventas..."
                                    className="h-12 rounded-xl border border-cyan-200 px-4"
                                />
                                <input
                                    name="phone"
                                    required
                                    placeholder="Teléfono"
                                    className="h-12 rounded-xl border border-cyan-200 px-4"
                                />
                                <textarea
                                    name="description"
                                    required
                                    minLength={15}
                                    rows={5}
                                    placeholder="Describe qué necesitas desarrollar..."
                                    className="rounded-xl border border-cyan-200 p-4"
                                />
                                {Object.values(errors).length > 0 && (
                                    <p className="text-sm text-red-500">
                                        {Object.values(errors)[0]}
                                    </p>
                                )}
                                <button
                                    disabled={processing}
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 font-bold text-slate-900"
                                >
                                    <Send className="size-4" /> Enviar
                                    cotización
                                </button>
                            </>
                        )}
                    </Form>
                ) : (
                    <div className="mt-6 rounded-2xl bg-cyan-50 p-5 text-sm">
                        Inicia sesión para enviar y revisar tu cotización.{' '}
                        <Link
                            href={login()}
                            className="font-bold text-cyan-600"
                        >
                            Ingresar
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
