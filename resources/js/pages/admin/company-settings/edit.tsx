import { Form, Head } from '@inertiajs/react';
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
}: {
    settings: Settings;
    hasSecretKey: boolean;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Empresa y pagos" />
            <div className="flex max-w-5xl flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Empresa, pagos y WhatsApp
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Activa métodos y guarda las credenciales cifradas de la
                        pasarela.
                    </p>
                </div>
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
                                <Toggle
                                    name="payment_yape_enabled"
                                    label="Yape / Plin"
                                    checked={Boolean(
                                        settings.payment_yape_enabled ?? true,
                                    )}
                                />
                                <input
                                    name="yape_number"
                                    defaultValue={String(
                                        settings.yape_number ?? '',
                                    )}
                                    placeholder="Número Yape / Plin"
                                    className={input}
                                />
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
                                    label="Tarjeta mediante pasarela"
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
                                    <option value="mercadopago">
                                        Mercado Pago
                                    </option>
                                    <option value="niubiz">Niubiz</option>
                                </select>
                                <Toggle
                                    name="payment_test_mode"
                                    label="Modo de pruebas"
                                    checked={Boolean(
                                        settings.payment_test_mode ?? true,
                                    )}
                                />
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
                                    <option value="permanent">Permanente</option>
                                </select>
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
