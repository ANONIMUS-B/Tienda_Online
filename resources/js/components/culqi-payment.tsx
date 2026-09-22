import { router, useHttp } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    CircleAlert,
    CreditCard,
    RefreshCw,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';

export type PaymentAttempt = {
    id: number;
    reference: string;
    environment: 'test' | 'live';
    amount: number;
    status: string;
    charge_id: string | null;
    message: string | null;
    created_at: string;
};

export type CulqiConfiguration = {
    enabled: boolean;
    publicKey: string | null;
    testMode: boolean;
    cards: boolean;
    yape: boolean;
    rsaId: string | null;
    rsaPublicKey: string | null;
    amount: number;
    email: string;
    title: string;
    chargeUrl: string;
    statusUrl: string;
    cancelUrl: string;
    attempt: PaymentAttempt | null;
};

type Authentication = {
    eci: string;
    xid: string;
    cavv: string;
    protocolVersion: string;
    directoryServerTransactionId: string;
};
type Token = { id: string; email: string };
export type Checkout = {
    token?: Token;
    order?: { id: string };
    error?: { user_message?: string };
    culqi: () => void;
    open: () => void;
    close: () => void;
};
declare global {
    interface Window {
        CulqiCheckout: new (
            key: string,
            configuration: Record<string, unknown>,
        ) => Checkout;
        Culqi3DS: {
            publicKey: string;
            settings: Record<string, unknown>;
            options: Record<string, unknown>;
            generateDevice: () => Promise<string>;
            initAuthentication: (token: string) => void;
            reset: () => void;
        };
    }
}

const scripts = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
    const existing = scripts.get(src);
    if (existing) return existing;
    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            script.remove();
            scripts.delete(src);
            reject(
                new Error('No se pudo conectar con Culqi. Revisa tu conexión.'),
            );
        };
        document.head.appendChild(script);
    });
    scripts.set(src, promise);
    return promise;
}

export const paymentLabels: Record<string, string> = {
    processing: 'Procesando',
    requires_action: 'Verificación del banco pendiente',
    unknown: 'Pendiente de confirmación',
    paid: 'Pagado',
    test_paid: 'Prueba aprobada (sin cobro real)',
    failed: 'No aprobado',
    refund_pending: 'Devolución pendiente',
    refunded: 'Devuelto',
};

export default function CulqiPayment({
    config,
    paid,
}: {
    config: CulqiConfiguration;
    paid: boolean;
}) {
    const [attempt, setAttempt] = useState(config.attempt);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const http = useHttp<
        Record<string, string>,
        { attempt: PaymentAttempt | null }
    >({});
    const checkout = useRef<Checkout | null>(null);
    const token = useRef<Token | null>(null);
    const device = useRef<string | null>(null);
    const sending = useRef(false);
    const awaiting3ds = useRef(false);
    const authenticate = useRef<(parameters: Authentication) => void>(() => {});
    const poll = useRef<() => Promise<void>>(async () => {});
    const blocked =
        paid ||
        (!!attempt &&
            !['failed', 'test_paid'].includes(attempt.status) &&
            !(attempt.environment === 'test' && attempt.status === 'refunded'));

    function showResult(result: PaymentAttempt | null) {
        setAttempt(result);
        setMessage(result?.message ?? 'Todavía no se ha registrado un pago.');
        if (result?.status === 'paid' || result?.status === 'refunded') {
            router.reload({ only: ['order'] });
        }
    }

    async function submit(parameters?: Authentication) {
        if (!token.current || sending.current) return;
        sending.current = true;
        setBusy(true);
        try {
            http.transform(() => ({
                source_id: token.current!.id,
                email: token.current!.email,
                device_id: device.current,
                ...(parameters ? { authentication_3DS: parameters } : {}),
            }));
            const response = await http.post(config.chargeUrl);
            showResult(response.attempt);
            if (response.attempt?.status === 'requires_action') {
                awaiting3ds.current = true;
                window.Culqi3DS.initAuthentication(token.current.id);
            }
        } catch {
            setMessage(
                'No pudimos confirmar el resultado. Pulsa «Consultar estado» antes de volver a pagar.',
            );
            setAttempt(
                (current) =>
                    current ?? {
                        id: 0,
                        reference: '',
                        amount: config.amount,
                        environment: config.testMode ? 'test' : 'live',
                        status: 'unknown',
                        charge_id: null,
                        message: null,
                        created_at: '',
                    },
            );
        } finally {
            sending.current = false;
            setBusy(false);
        }
    }
    authenticate.current = (parameters) => {
        void submit(parameters);
    };

    useEffect(() => {
        function receive(event: MessageEvent) {
            if (
                event.origin !== window.location.origin ||
                !awaiting3ds.current ||
                !event.data ||
                typeof event.data !== 'object'
            )
                return;
            if (event.data.parameters3DS) {
                awaiting3ds.current = false;
                authenticate.current(
                    event.data.parameters3DS as Authentication,
                );
            } else if (event.data.error) {
                awaiting3ds.current = false;
                setBusy(false);
                setMessage(
                    'No se completó la verificación del banco. Puedes continuar la verificación.',
                );
            }
        }
        window.addEventListener('message', receive);
        return () => {
            window.removeEventListener('message', receive);
            checkout.current?.close();
        };
    }, []);

    async function openCheckout() {
        if (!config.publicKey || busy) return;
        setBusy(true);
        setMessage('');
        try {
            await Promise.all([
                loadScript('https://js.culqi.com/checkout-js'),
                loadScript('https://3ds.culqi.com'),
            ]);
            window.Culqi3DS.reset();
            window.Culqi3DS.publicKey = config.publicKey;
            window.Culqi3DS.settings = {
                charge: {
                    totalAmount: config.amount,
                    currency: 'PEN',
                    returnUrl: window.location.href,
                },
                card: { email: config.email },
            };
            window.Culqi3DS.options = {
                showModal: true,
                showLoading: true,
                showIcon: true,
                closeModalAction: () => {
                    setBusy(false);
                },
            };
            const instance = new window.CulqiCheckout(config.publicKey, {
                settings: {
                    title: config.title,
                    currency: 'PEN',
                    amount: config.amount,
                    ...(config.rsaId && config.rsaPublicKey
                        ? {
                              xculqirsaid: config.rsaId,
                              rsapublickey: config.rsaPublicKey,
                          }
                        : {}),
                },
                client: { email: config.email },
                options: {
                    lang: 'es',
                    installments: false,
                    modal: true,
                    paymentMethods: {
                        tarjeta: config.cards,
                        yape: config.yape,
                        billetera: false,
                        bancaMovil: false,
                        agente: false,
                        cuotealo: false,
                    },
                    paymentMethodsSort: ['tarjeta', 'yape'],
                },
            });
            checkout.current = instance;
            instance.culqi = () => {
                if (instance.token) {
                    token.current = {
                        id: instance.token.id,
                        email: instance.token.email || config.email,
                    };
                    instance.close();
                    void (async () => {
                        try {
                            if (instance.token!.id.startsWith('tkn_')) {
                                window.Culqi3DS.settings = {
                                    charge: {
                                        totalAmount: config.amount,
                                        currency: 'PEN',
                                        returnUrl: window.location.href,
                                    },
                                    card: { email: token.current!.email },
                                };
                                device.current =
                                    await window.Culqi3DS.generateDevice();
                                if (!device.current) throw new Error();
                            } else {
                                device.current = null;
                            }
                            await submit();
                        } catch {
                            setMessage(
                                'No se pudo iniciar la verificación del banco. Inténtalo nuevamente.',
                            );
                            setBusy(false);
                        }
                    })();
                } else if (instance.error) {
                    setMessage(
                        instance.error.user_message ??
                            'Revisa los datos de pago.',
                    );
                }
            };
            instance.open();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Culqi no está disponible.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function refresh() {
        setBusy(true);
        try {
            http.transform(() => ({}));
            showResult((await http.get(config.statusUrl)).attempt);
        } catch {
            setMessage(
                'No se pudo consultar el pago. Inténtalo en unos momentos.',
            );
        } finally {
            setBusy(false);
        }
    }
    poll.current = refresh;
    const pollStatus = attempt?.status;
    const hasError =
        attempt?.status === 'failed' || Object.keys(http.errors).length > 0;

    useEffect(() => {
        if (
            !pollStatus ||
            !['processing', 'unknown', 'refund_pending'].includes(pollStatus)
        )
            return;
        let cancelled = false;
        let count = 0;
        let timer: ReturnType<typeof setTimeout>;
        const check = async () => {
            if (cancelled) return;
            await poll.current();
            if (!cancelled && ++count < 10)
                timer = setTimeout(() => void check(), 6000);
        };
        timer = setTimeout(() => void check(), 6000);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [pollStatus]);

    return (
        <section className="my-6 overflow-hidden rounded-3xl border border-cyan-200/80 bg-white shadow-lg shadow-cyan-950/5">
            <div className="bg-gradient-to-r from-cyan-600 to-sky-500 px-6 py-5 text-white sm:px-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-[.16em] text-cyan-50 uppercase">
                            Pago seguro
                        </p>
                        <h2 className="mt-1 text-xl font-black">
                            Yape o tarjeta con Culqi
                        </h2>
                    </div>
                    <ShieldCheck className="size-9 shrink-0 text-white/90" />
                </div>
            </div>
            <div className="grid gap-5 p-6 text-slate-900 sm:p-7">
                {config.testMode && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                        Modo de pruebas: no se cobra dinero real ni se confirma
                        la venta.
                    </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                    {config.yape && (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span className="grid size-10 place-items-center rounded-xl bg-purple-100 text-purple-700">
                                <Smartphone className="size-5" />
                            </span>
                            <div>
                                <p className="font-bold">Yape</p>
                                <p className="text-xs text-slate-500">
                                    Número y código de aprobación
                                </p>
                            </div>
                        </div>
                    )}
                    {config.cards && (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span className="grid size-10 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                                <CreditCard className="size-5" />
                            </span>
                            <div>
                                <p className="font-bold">Tarjeta</p>
                                <p className="text-xs text-slate-500">
                                    Crédito o débito con protección 3DS
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {attempt && (
                    <p
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${hasError ? 'bg-red-100 text-red-700' : attempt.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}
                    >
                        {paymentLabels[attempt.status] ?? attempt.status}
                    </p>
                )}
                {(message || attempt?.message) && (
                    <div
                        role="status"
                        className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${hasError ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    >
                        {hasError && (
                            <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        )}
                        <p>{message || attempt?.message}</p>
                    </div>
                )}
                {Object.values(http.errors).map((error, index) => (
                    <p
                        key={index}
                        className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                        {String(error)}
                    </p>
                ))}
                {!config.enabled && (
                    <p>
                        Los pagos en línea no están disponibles en este momento.
                        Contacta a la tienda.
                    </p>
                )}
                {config.enabled && !config.cards && !config.yape && (
                    <p>
                        El importe supera el límite del medio habilitado.
                        Contacta a la tienda para otro medio de pago.
                    </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                    {config.enabled &&
                        (config.cards || config.yape) &&
                        !blocked && (
                            <Button
                                onClick={() => void openCheckout()}
                                disabled={
                                    busy ||
                                    config.amount < 300 ||
                                    config.amount > 999900
                                }
                                className="min-h-12 flex-1 rounded-xl bg-cyan-500 text-base font-black text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400"
                            >
                                {busy
                                    ? 'Procesando…'
                                    : `Pagar S/ ${(config.amount / 100).toFixed(2)}`}
                            </Button>
                        )}
                    {attempt?.status === 'requires_action' && token.current && (
                        <Button
                            onClick={() => {
                                awaiting3ds.current = true;
                                window.Culqi3DS.initAuthentication(
                                    token.current!.id,
                                );
                            }}
                            disabled={busy}
                        >
                            Continuar verificación del banco
                        </Button>
                    )}
                    {attempt?.status === 'requires_action' && (
                        <Button
                            variant="outline"
                            disabled={busy}
                            onClick={async () => {
                                setBusy(true);
                                awaiting3ds.current = false;
                                try {
                                    http.transform(() => ({}));
                                    showResult(
                                        (await http.delete(config.cancelUrl))
                                            .attempt,
                                    );
                                } catch {
                                    setMessage(
                                        'No se pudo cancelar la verificación. Consulta el estado.',
                                    );
                                } finally {
                                    setBusy(false);
                                }
                            }}
                        >
                            Cancelar verificación y elegir otro medio
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => void refresh()}
                        className="min-h-12 rounded-xl px-5"
                    >
                        <RefreshCw
                            className={`size-4 ${busy ? 'animate-spin' : ''}`}
                        />
                        Consultar estado
                    </Button>
                </div>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    Culqi procesa tus datos de pago. JBTECHLINE no almacena los
                    datos de tu tarjeta.
                </p>
            </div>
        </section>
    );
}
