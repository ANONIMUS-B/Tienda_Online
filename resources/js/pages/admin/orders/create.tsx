import { Head, Link, useForm, useHttp } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { show as lookup } from '@/routes/admin/identity-lookup';
import { index, store } from '@/routes/admin/orders';

type Product = {
    id: number;
    name: string;
    sku: string;
    price: string;
    promotional_price: string | null;
    stock: number;
};
type Item = {
    product_id: string;
    name: string;
    quantity: string;
    unit_price: string;
};
type Identity = {
    customer_name: string;
    document_number: string;
    address: string;
    status: string | null;
    condition: string | null;
};
const emptyItem = (): Item => ({
    product_id: '',
    name: '',
    quantity: '1',
    unit_price: '',
});
const inputClass = 'h-10 w-full rounded-md border bg-background px-3';

export default function CreateOrder({
    products,
    identityLookupEnabled,
    culqiEnabled,
    currentTeam,
}: {
    products: Product[];
    identityLookupEnabled: boolean;
    culqiEnabled: boolean;
    currentTeam: { slug: string };
}) {
    const form = useForm({
        receipt_type: 'boleta',
        document_type: 'dni',
        document_number: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        address: '',
        payment_method: 'yape',
        payment_status: 'pending',
        payment_reference: '',
        notes: '',
        requires_identification: false,
        items: [emptyItem()],
    });
    const identity = useHttp<Record<string, never>, Identity>({});
    const [lookupMessage, setLookupMessage] = useState('');
    const total =
        form.data.items.reduce(
            (sum, item) =>
                sum +
                Math.round(Number(item.unit_price) * 100) *
                    Number(item.quantity),
            0,
        ) / 100;
    const changeItem = (index: number, change: Partial<Item>) =>
        form.setData(
            'items',
            form.data.items.map((item, position) =>
                position === index ? { ...item, ...change } : item,
            ),
        );

    async function searchIdentity() {
        setLookupMessage('');
        try {
            const result = await identity.get(
                lookup.url(currentTeam.slug, {
                    query: {
                        document_type: form.data.document_type,
                        document_number: form.data.document_number,
                    },
                }),
            );
            form.setData((data) => ({
                ...data,
                customer_name: result.customer_name,
                address: result.address || data.address,
            }));
            setLookupMessage(
                [result.status, result.condition].filter(Boolean).join(' · ') ||
                    'Datos encontrados. Revisa el nombre antes de guardar.',
            );
        } catch {
            setLookupMessage(
                'No se pudo consultar. Revisa la configuración y el documento o ingresa los datos manualmente.',
            );
        }
    }

    return (
        <>
            <Head title="Nueva venta / WhatsApp" />
            <form
                className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(store.url(currentTeam.slug));
                }}
            >
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Nueva venta / WhatsApp
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Registra la venta sin que el cliente tenga una
                            cuenta. Luego podrás emitir y compartir su
                            comprobante.
                        </p>
                    </div>
                    <Link href={index(currentTeam.slug)}>Volver a pedidos</Link>
                </header>
                <section className="bg-card grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
                    <h2 className="font-semibold sm:col-span-2">
                        Cliente y comprobante
                    </h2>
                    <label className="grid gap-1 text-sm">
                        Comprobante
                        <select
                            className={inputClass}
                            value={form.data.receipt_type}
                            disabled={identity.processing}
                            onChange={(event) =>
                                form.setData((data) => ({
                                    ...data,
                                    receipt_type: event.target.value,
                                    document_type:
                                        event.target.value === 'factura'
                                            ? 'ruc'
                                            : data.document_type,
                                    document_number: '',
                                }))
                            }
                        >
                            <option value="boleta">Boleta</option>
                            <option value="factura">Factura</option>
                        </select>
                    </label>
                    <label className="grid gap-1 text-sm">
                        Identificación
                        <select
                            className={inputClass}
                            value={form.data.document_type}
                            disabled={identity.processing}
                            onChange={(event) => {
                                form.setData((data) => ({
                                    ...data,
                                    document_type: event.target.value,
                                    document_number: '',
                                    customer_name: '',
                                    address: '',
                                }));
                                setLookupMessage('');
                            }}
                        >
                            <option
                                value="dni"
                                disabled={form.data.receipt_type === 'factura'}
                            >
                                DNI
                            </option>
                            <option value="ruc">RUC</option>
                            <option
                                value="none"
                                disabled={form.data.receipt_type === 'factura'}
                            >
                                Sin documento / consumidor final
                            </option>
                        </select>
                    </label>
                    {form.data.document_type !== 'none' && (
                        <div className="flex items-end gap-2">
                            <label className="grid flex-1 gap-1 text-sm">
                                Número de documento
                                <input
                                    className={inputClass}
                                    inputMode="numeric"
                                    value={form.data.document_number}
                                    maxLength={
                                        form.data.document_type === 'ruc'
                                            ? 11
                                            : 8
                                    }
                                    disabled={identity.processing}
                                    onChange={(event) =>
                                        form.setData(
                                            'document_number',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    !identityLookupEnabled ||
                                    identity.processing ||
                                    !form.data.document_number
                                }
                                onClick={searchIdentity}
                            >
                                {identity.processing ? 'Buscando…' : 'Buscar'}
                            </Button>
                        </div>
                    )}
                    <label className="grid gap-1 text-sm">
                        Nombres completos / razón social
                        <input
                            className={inputClass}
                            value={form.data.customer_name}
                            disabled={identity.processing}
                            placeholder={
                                form.data.document_type === 'none'
                                    ? 'CLIENTE VARIOS'
                                    : ''
                            }
                            onChange={(event) =>
                                form.setData(
                                    'customer_name',
                                    event.target.value,
                                )
                            }
                        />
                    </label>
                    <p
                        className="text-muted-foreground text-sm sm:col-span-2"
                        role="status"
                    >
                        {lookupMessage ||
                            (identityLookupEnabled
                                ? 'Puedes consultar DNI/RUC o completar los datos manualmente.'
                                : 'Consulta automática desactivada. Configúrala en Facturación electrónica o ingresa los datos manualmente.')}
                    </p>
                    <label className="grid gap-1 text-sm">
                        WhatsApp / teléfono (opcional)
                        <input
                            className={inputClass}
                            value={form.data.customer_phone}
                            placeholder="51999888777"
                            onChange={(event) =>
                                form.setData(
                                    'customer_phone',
                                    event.target.value,
                                )
                            }
                        />
                    </label>
                    <label className="grid gap-1 text-sm">
                        Correo (obligatorio para Culqi)
                        <input
                            className={inputClass}
                            type="email"
                            value={form.data.customer_email}
                            onChange={(event) =>
                                form.setData(
                                    'customer_email',
                                    event.target.value,
                                )
                            }
                        />
                    </label>
                    <label className="grid gap-1 text-sm sm:col-span-2">
                        Dirección (obligatoria para factura)
                        <input
                            className={inputClass}
                            value={form.data.address}
                            disabled={identity.processing}
                            onChange={(event) =>
                                form.setData('address', event.target.value)
                            }
                        />
                    </label>
                    <label className="flex items-start gap-2 text-sm sm:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.data.requires_identification}
                            onChange={(event) =>
                                form.setData(
                                    'requires_identification',
                                    event.target.checked,
                                )
                            }
                        />
                        El cliente solicita identificación o la operación la
                        requiere (por ejemplo, deducción de gastos o reintegro
                        tributario).
                    </label>
                    <p className="text-muted-foreground text-sm sm:col-span-2">
                        Sin documento: solo boletas de hasta S/ 700 en
                        operaciones que no exijan identificar al cliente. Este
                        formulario registra ventas nacionales en soles, gravadas
                        con IGV del 18 %.
                    </p>
                </section>
                <section className="bg-card grid gap-4 rounded-xl border p-5">
                    <h2 className="font-semibold">Detalle de la venta</h2>
                    <p className="text-muted-foreground text-sm">
                        Los precios incluyen IGV. Los productos del catálogo
                        descuentan stock; los conceptos manuales no afectan
                        inventario.
                    </p>
                    {form.data.items.map((item, position) => (
                        <div
                            key={position}
                            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                        >
                            <label className="grid gap-1 text-sm">
                                Producto / concepto
                                <select
                                    className={inputClass}
                                    value={item.product_id}
                                    onChange={(event) => {
                                        const product = products.find(
                                            (entry) =>
                                                entry.id ===
                                                Number(event.target.value),
                                        );
                                        changeItem(
                                            position,
                                            product
                                                ? {
                                                      product_id: String(
                                                          product.id,
                                                      ),
                                                      name: product.name,
                                                      unit_price:
                                                          product.promotional_price ??
                                                          product.price,
                                                  }
                                                : {
                                                      product_id: '',
                                                      name: '',
                                                      unit_price: '',
                                                  },
                                        );
                                    }}
                                >
                                    <option value="">Concepto manual</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.sku} · {product.name} ·
                                            Stock: {product.stock}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">
                                Descripción
                                <input
                                    className={inputClass}
                                    value={item.name}
                                    readOnly={!!item.product_id}
                                    onChange={(event) =>
                                        changeItem(position, {
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label className="grid gap-1 text-sm">
                                Cantidad
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={item.quantity}
                                    onChange={(event) =>
                                        changeItem(position, {
                                            quantity: event.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label className="grid gap-1 text-sm">
                                Precio unitario con IGV (S/)
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(event) =>
                                        changeItem(position, {
                                            unit_price: event.target.value,
                                        })
                                    }
                                />
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.data.items.length === 1}
                                onClick={() =>
                                    form.setData(
                                        'items',
                                        form.data.items.filter(
                                            (_, index) => index !== position,
                                        ),
                                    )
                                }
                            >
                                Quitar concepto
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.data.items.length >= 100}
                        onClick={() =>
                            form.setData('items', [
                                ...form.data.items,
                                emptyItem(),
                            ])
                        }
                    >
                        Agregar concepto
                    </Button>
                    <p className="text-right text-xl font-semibold">
                        Total: S/{' '}
                        {Number.isFinite(total) ? total.toFixed(2) : '0.00'}
                    </p>
                </section>
                <section className="bg-card grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
                    <h2 className="font-semibold sm:col-span-2">Pago</h2>
                    <label className="grid gap-1 text-sm">
                        Medio de pago
                        <select
                            className={inputClass}
                            value={form.data.payment_method}
                            onChange={(event) =>
                                form.setData({
                                    ...form.data,
                                    payment_method: event.target.value,
                                    payment_status:
                                        event.target.value === 'gateway'
                                            ? 'pending'
                                            : form.data.payment_status,
                                })
                            }
                        >
                            {culqiEnabled && (
                                <option value="gateway">
                                    Culqi: enviar enlace de pago
                                </option>
                            )}
                            <option value="bank_transfer">Transferencia</option>
                            <option value="cash_on_delivery">Efectivo</option>
                        </select>
                    </label>
                    <label className="grid gap-1 text-sm">
                        Estado
                        <select
                            className={inputClass}
                            value={
                                form.data.payment_method === 'gateway'
                                    ? 'pending'
                                    : form.data.payment_status
                            }
                            disabled={form.data.payment_method === 'gateway'}
                            onChange={(event) =>
                                form.setData(
                                    'payment_status',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="pending">
                                Pendiente de verificación
                            </option>
                            <option value="paid">
                                Pagado: ya verifiqué el abono
                            </option>
                        </select>
                    </label>
                    <label className="grid gap-1 text-sm">
                        Número de operación (opcional)
                        <input
                            className={inputClass}
                            value={form.data.payment_reference}
                            onChange={(event) =>
                                form.setData(
                                    'payment_reference',
                                    event.target.value,
                                )
                            }
                        />
                    </label>
                    <label className="grid gap-1 text-sm">
                        Notas
                        <input
                            className={inputClass}
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                        />
                    </label>
                    <p className="text-muted-foreground text-sm sm:col-span-2">
                        Marcar «Pagado» registra tu verificación manual del
                        abono.
                    </p>
                </section>
                {form.hasErrors && (
                    <ul
                        role="alert"
                        className="text-destructive list-inside list-disc rounded-lg border p-4"
                    >
                        {Object.entries(form.errors).map(([field, message]) => (
                            <li key={field}>{message}</li>
                        ))}
                    </ul>
                )}
                <Button
                    type="submit"
                    disabled={form.processing || identity.processing}
                >
                    {form.processing
                        ? 'Guardando…'
                        : 'Guardar venta y continuar a emisión'}
                </Button>
            </form>
        </>
    );
}
