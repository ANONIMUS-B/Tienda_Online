import { router, useHttp } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Checkout, PaymentAttempt } from '@/components/culqi-payment';

type PagoEfectivoAttempt = PaymentAttempt & {
    provider_order_id?: string | null;
    expires_at?: string | null;
    provider_data?: { payment_code?: string | null } | null;
};

export type PagoEfectivoConfiguration = {
    enabled: boolean;
    publicKey: string | null;
    testMode: boolean;
    amount: number;
    title: string;
    createUrl: string;
    statusUrl: string;
    attempt: PagoEfectivoAttempt | null;
};

const scripts = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
    const existing = scripts.get(src);
    if (existing) return existing;
    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error('No se pudo cargar PagoEfectivo.'));
        document.head.appendChild(script);
    });
    scripts.set(src, promise);
    return promise;
}

export default function PagoEfectivoPayment({
    config,
    paid,
}: {
    config: PagoEfectivoConfiguration;
    paid: boolean;
}) {
    const [attempt, setAttempt] = useState(config.attempt);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const http = useHttp<
        Record<string, never>,
        { attempt: PagoEfectivoAttempt | null }
    >({});

    async function createCip() {
        if (!config.publicKey || busy) return;
        setBusy(true);
        setMessage('');
        try {
            const response = await http.post(config.createUrl);
            const created = response.attempt;
            setAttempt(created);
            if (!created?.provider_order_id || created.status === 'failed') {
                setMessage(
                    created?.message ?? 'No se pudo generar el código de pago.',
                );
                return;
            }
            await loadScript('https://js.culqi.com/checkout-js');
            const checkout: Checkout = new window.CulqiCheckout(
                config.publicKey,
                {
                    settings: {
                        title: config.title,
                        currency: 'PEN',
                        amount: config.amount,
                        order: created.provider_order_id,
                    },
                    options: {
                        lang: 'es',
                        modal: true,
                        paymentMethods: {
                            tarjeta: false,
                            yape: false,
                            billetera: false,
                            bancaMovil: true,
                            agente: true,
                            cuotealo: false,
                        },
                        paymentMethodsSort: ['bancaMovil', 'agente'],
                    },
                },
            );
            checkout.culqi = () => {
                if (checkout.error)
                    setMessage(
                        checkout.error.user_message ??
                            'No se pudo generar el CIP.',
                    );
                else
                    setMessage(
                        'Código generado. Págalo en tu banca móvil, agente o bodega y luego consulta el estado.',
                    );
            };
            checkout.open();
        } catch {
            setMessage(
                'No se pudo iniciar PagoEfectivo. Inténtalo nuevamente.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function refresh() {
        setBusy(true);
        try {
            const response = await http.get(config.statusUrl);
            setAttempt(response.attempt);
            setMessage(response.attempt?.message ?? 'El pago sigue pendiente.');
            if (['paid', 'test_paid'].includes(response.attempt?.status ?? ''))
                router.reload({ only: ['order'] });
        } catch {
            setMessage('No se pudo consultar el pago.');
        } finally {
            setBusy(false);
        }
    }

    const code = attempt?.provider_data?.payment_code;

    return (
        <section className="my-6 grid gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-slate-900">
            <h2 className="font-semibold">PagoEfectivo</h2>
            {config.testMode && (
                <p className="rounded-md bg-amber-100 p-3 text-sm text-amber-900">
                    Modo de pruebas: no se cobrará dinero real.
                </p>
            )}
            <p className="text-sm">
                Genera un código CIP y págalo desde la banca móvil o en agentes
                y bodegas autorizadas. La confirmación llegará automáticamente.
            </p>
            {code && (
                <p className="rounded-lg bg-white p-4 text-center font-mono text-2xl font-black tracking-widest">
                    CIP {code}
                </p>
            )}
            {attempt?.expires_at && (
                <p className="text-xs">
                    Vence:{' '}
                    {new Date(attempt.expires_at).toLocaleString('es-PE')}
                </p>
            )}
            {(message || attempt?.message) && (
                <p role="status" className="text-sm">
                    {message || attempt?.message}
                </p>
            )}
            <div className="flex flex-wrap gap-3">
                {!paid &&
                    config.enabled &&
                    !['paid', 'test_paid'].includes(attempt?.status ?? '') && (
                        <Button
                            disabled={busy}
                            onClick={() => void createCip()}
                        >
                            {busy
                                ? 'Procesando…'
                                : attempt?.provider_order_id
                                  ? 'Abrir instrucciones de pago'
                                  : `Generar CIP por S/ ${(config.amount / 100).toFixed(2)}`}
                        </Button>
                    )}
                <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void refresh()}
                >
                    Consultar estado
                </Button>
            </div>
        </section>
    );
}
