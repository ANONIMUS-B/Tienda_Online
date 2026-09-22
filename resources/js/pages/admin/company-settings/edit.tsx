import { Form, Head, Link } from '@inertiajs/react';
import { index as paymentsIndex } from '@/routes/admin/culqi';
import { CreditCard, MessageCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { update, edit } from '@/routes/admin/company-settings';

type Settings = Record<string, string | boolean | null>;
const input = 'w-full rounded-md border bg-transparent px-3 py-2';
const Toggle = ({
    name,
    label,
    checked,
}: {
    name: string;
    label: string;
    checked: boolean;
}) => (
    <label className="flex items-center gap-3 rounded-lg border p-3">
        <input type="hidden" name={name} value="0" />
        <input type="checkbox" name={name} value="1" defaultChecked={checked} />
        <span>{label}</span>
    </label>
);
export default function CompanySettings({
    settings,
    hasSecretKey,
    currentTeam,
    culqiWebhookUrl,
    hasIzipayCredentials,
}: {
    settings: Settings;
    hasSecretKey: boolean;
    culqiWebhookUrl: string;
    hasIzipayCredentials: boolean;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Empresa y pagos" />
            <div className="flex w-full flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Empresa, pagos y WhatsApp
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Activa métodos y guarda las credenciales cifradas de la
                        pasarela.
                    </p>
                </div>
                <Link
                    href={paymentsIndex(currentTeam.slug)}
                    className="text-sm underline"
                >
                    Ver cobros y devoluciones Culqi
                </Link>
                <Form
                    {...update.form(currentTeam.slug)}
                    className="grid gap-6 lg:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <section className="bg-card grid gap-4 rounded-xl border p-6">
                                <h2 className="flex items-center gap-2 font-semibold">
                                    <MessageCircle className="size-5" />
                                    Contacto
                                </h2>
                                <input
                                    name="company_name"
                                    defaultValue={String(
                                        settings.company_name ?? 'JBTECHLINE',
                                    )}
                                    placeholder="Empresa"
                                    className={input}
                                />
                                <input
                                    name="phone"
                                    defaultValue={String(settings.phone ?? '')}
                                    placeholder="Teléfono"
                                    className={input}
                                />
                                <input
                                    name="whatsapp_number"
                                    defaultValue={String(
                                        settings.whatsapp_number ?? '',
                                    )}
                                    placeholder="WhatsApp: 51999999999"
                                    className={input}
                                />
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={String(settings.email ?? '')}
                                    placeholder="Correo"
                                    className={input}
                                />
                                <input
                                    name="address"
                                    defaultValue={String(
                                        settings.address ?? '',
                                    )}
                                    placeholder="Dirección"
                                    className={input}
                                />
                                <input
                                    name="facebook_url"
                                    type="url"
                                    defaultValue={String(
                                        settings.facebook_url ?? '',
                                    )}
                                    placeholder="Facebook URL"
                                    className={input}
                                />
                                <input
                                    name="instagram_url"
                                    type="url"
                                    defaultValue={String(
                                        settings.instagram_url ?? '',
                                    )}
                                    placeholder="Instagram URL"
                                    className={input}
                                />
                                <input
                                    name="tiktok_url"
                                    type="url"
                                    defaultValue={String(
                                        settings.tiktok_url ?? '',
                                    )}
                                    placeholder="TikTok URL"
                                    className={input}
                                />
                                <Toggle
                                    name="whatsapp_checkout_enabled"
                                    label="Mostrar opción de compra por WhatsApp"
                                    checked={Boolean(
                                        settings.whatsapp_checkout_enabled ??
                                        true,
                                    )}
                                />
                            </section>
                            <section className="bg-card grid gap-4 rounded-xl border p-6">
                                <h2 className="flex items-center gap-2 font-semibold">
                                    <CreditCard className="size-5" />
                                    Métodos de pago
                                </h2>
                                <input
                                    type="hidden"
                                    name="payment_yape_enabled"
                                    value="0"
                                />
                                <p className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">
                                    Los pagos con Yape se administran desde
                                    Culqi y se confirman automáticamente.
                                </p>
                                <Toggle
                                    name="payment_transfer_enabled"
                                    label="Transferencia bancaria"
                                    checked={Boolean(
                                        settings.payment_transfer_enabled ??
                                        true,
                                    )}
                                />
                                <input
                                    name="bank_name"
                                    defaultValue={String(
                                        settings.bank_name ?? '',
                                    )}
                                    placeholder="Banco"
                                    className={input}
                                />
                                <input
                                    name="bank_account"
                                    defaultValue={String(
                                        settings.bank_account ?? '',
                                    )}
                                    placeholder="Cuenta o CCI"
                                    className={input}
                                />
                                <Toggle
                                    name="payment_cash_enabled"
                                    label="Pago contra entrega"
                                    checked={Boolean(
                                        settings.payment_cash_enabled ?? true,
                                    )}
                                />
                                <Toggle
                                    name="payment_gateway_enabled"
                                    label="Culqi: tarjeta y Yape con confirmación automática"
                                    checked={Boolean(
                                        settings.payment_gateway_enabled ??
                                        false,
                                    )}
                                />
                                <select
                                    name="payment_gateway"
                                    defaultValue={String(
                                        settings.payment_gateway ?? '',
                                    )}
                                    className={input}
                                >
                                    <option value="">
                                        Seleccionar pasarela
                                    </option>
                                    <option value="culqi">Culqi</option>
                                </select>
                                <Toggle
                                    name="payment_test_mode"
                                    label="Modo de pruebas"
                                    checked={Boolean(
                                        settings.payment_test_mode ?? true,
                                    )}
                                />
                                <input
                                    name="gateway_public_key"
                                    placeholder="Llave pública (vacío conserva la actual)"
                                    className={input}
                                />
                                <input
                                    name="gateway_secret_key"
                                    type="password"
                                    placeholder={
                                        hasSecretKey
                                            ? 'Credencial secreta guardada · dejar vacío para conservar'
                                            : 'Llave secreta'
                                    }
                                    className={input}
                                />
                                <p className="text-muted-foreground text-xs">
                                    Las llaves se cifran antes de guardarse y la
                                    llave secreta nunca vuelve al navegador.
                                </p>
                                <Toggle
                                    name="culqi_cards_enabled"
                                    label="Aceptar tarjetas con Culqi"
                                    checked={Boolean(
                                        settings.culqi_cards_enabled ?? true,
                                    )}
                                />
                                <Toggle
                                    name="culqi_yape_enabled"
                                    label="Aceptar Yape con código de aprobación"
                                    checked={Boolean(
                                        settings.culqi_yape_enabled ?? true,
                                    )}
                                />
                                <Toggle
                                    name="culqi_pagoefectivo_enabled"
                                    label="Aceptar PagoEfectivo con código CIP"
                                    checked={Boolean(
                                        settings.culqi_pagoefectivo_enabled ??
                                        false,
                                    )}
                                />
                                <label className="grid gap-1 text-sm">
                                    Vigencia del código CIP (horas)
                                    <input
                                        name="culqi_cip_expiration_hours"
                                        type="number"
                                        min="1"
                                        max="168"
                                        defaultValue={String(
                                            settings.culqi_cip_expiration_hours ??
                                                24,
                                        )}
                                        className={input}
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    ID RSA de Culqi (opcional)
                                    <input
                                        name="culqi_rsa_id"
                                        defaultValue={String(
                                            settings.culqi_rsa_id ?? '',
                                        )}
                                        className={input}
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    Llave pública RSA (opcional)
                                    <textarea
                                        name="culqi_rsa_public_key"
                                        defaultValue={String(
                                            settings.culqi_rsa_public_key ?? '',
                                        )}
                                        rows={4}
                                        className={input}
                                    />
                                </label>
                                <div className="grid gap-2 rounded-lg border p-4 text-sm">
                                    <h3 className="font-semibold">
                                        Activar Culqi
                                    </h3>
                                    <p>
                                        Ingresa las llaves de tu comercio desde
                                        CulqiPanel → Desarrollo → API Keys. Para
                                        pruebas utiliza pk_test_ y sk_test_;
                                        para cobros reales, pk_live_ y sk_live_.
                                        Cambia ambas llaves al cambiar de
                                        ambiente.
                                    </p>
                                    <p>
                                        El modo de pruebas no confirma ventas
                                        reales. Las tarjetas y Yape deben estar
                                        habilitados por Culqi para tu comercio.
                                        Yape utiliza el código de aprobación de
                                        la app; el QR manual se configura
                                        aparte.
                                    </p>
                                    <label className="grid gap-1">
                                        URL del webhook
                                        <input
                                            readOnly
                                            value={culqiWebhookUrl}
                                            onFocus={(event) =>
                                                event.target.select()
                                            }
                                            className={input}
                                        />
                                    </label>
                                    <p>
                                        En CulqiPanel → Eventos → Webhooks,
                                        registra esta URL con tu dominio público
                                        HTTPS para eventos de cargos y
                                        devoluciones. En localhost Culqi no
                                        puede enviar notificaciones. Configura
                                        APP_URL con tu dominio al publicar la
                                        tienda.
                                    </p>
                                    <a
                                        href="https://docs.culqi.com/es/documentacion/checkout/checkout-custom/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline"
                                    >
                                        Documentación de Culqi
                                    </a>
                                </div>
                                <div className="grid gap-3 rounded-lg border border-cyan-200 p-4 text-sm">
                                    <h3 className="font-semibold">
                                        Izipay Online
                                    </h3>
                                    <Toggle
                                        name="izipay_enabled"
                                        label="Activar Izipay (Yape, Plin, QR y tarjetas)"
                                        checked={Boolean(
                                            settings.izipay_enabled ?? false,
                                        )}
                                    />
                                    <input
                                        name="izipay_merchant_code"
                                        defaultValue={String(
                                            settings.izipay_merchant_code ?? '',
                                        )}
                                        placeholder="Código de comercio"
                                        className={input}
                                    />
                                    <textarea
                                        name="izipay_public_key"
                                        defaultValue={String(
                                            settings.izipay_public_key ?? '',
                                        )}
                                        placeholder="Llave pública RSA"
                                        rows={3}
                                        className={input}
                                    />
                                    <input
                                        name="izipay_api_username"
                                        placeholder={
                                            hasIzipayCredentials
                                                ? 'Usuario API guardado · dejar vacío para conservar'
                                                : 'Usuario API'
                                        }
                                        className={input}
                                    />
                                    <input
                                        name="izipay_api_password"
                                        type="password"
                                        placeholder={
                                            hasIzipayCredentials
                                                ? 'Contraseña API guardada · dejar vacío para conservar'
                                                : 'Contraseña API'
                                        }
                                        className={input}
                                    />
                                    <input
                                        name="izipay_hash_key"
                                        type="password"
                                        placeholder={
                                            hasIzipayCredentials
                                                ? 'Llave hash guardada · dejar vacío para conservar'
                                                : 'Llave hash de notificaciones'
                                        }
                                        className={input}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Izipay entrega estas credenciales
                                        después de afiliar el comercio. Se
                                        guardan cifradas. La activación del
                                        checkout requiere además el kit técnico
                                        asignado a tu contrato.
                                    </p>
                                    <a
                                        href="https://developers.izipay.pe/getting-started/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline"
                                    >
                                        Requisitos de afiliación de Izipay
                                    </a>
                                </div>
                                <h3 className="border-t pt-4 font-semibold">
                                    Membresía de programas
                                </h3>
                                <Toggle
                                    name="software_membership_enabled"
                                    label="Permitir membresías"
                                    checked={Boolean(
                                        settings.software_membership_enabled ??
                                        true,
                                    )}
                                />
                                <input
                                    name="software_membership_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={String(
                                        settings.software_membership_price ??
                                            '29.90',
                                    )}
                                    placeholder="Monto de la membresía"
                                    className={input}
                                />
                                <select
                                    name="software_membership_period"
                                    defaultValue={String(
                                        settings.software_membership_period ??
                                            'monthly',
                                    )}
                                    className={input}
                                >
                                    <option value="monthly">Mensual</option>
                                    <option value="annual">Anual</option>
                                    <option value="permanent">
                                        Permanente
                                    </option>
                                </select>
                                {Object.values(errors).length > 0 && (
                                    <p className="text-sm text-red-500">
                                        {Object.values(errors)[0]}
                                    </p>
                                )}
                                <Button disabled={processing} className="gap-2">
                                    <Save className="size-4" />
                                    Guardar configuración
                                </Button>
                            </section>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
CompanySettings.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Empresa y pagos', href: edit(props.currentTeam.slug) },
    ],
});
