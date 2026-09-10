import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/admin/brands';
import type { BrandSummary } from '@/types/brand';

export default function BrandForm({
    currentTeam,
    brand,
}: {
    currentTeam: { slug: string };
    brand?: BrandSummary;
}) {
    const form = brand
        ? update.form({ current_team: currentTeam.slug, brand: brand.slug })
        : store.form(currentTeam.slug);

    return (
        <Form
            {...form}
            className="bg-card grid max-w-3xl gap-6 rounded-xl border p-5 sm:p-7"
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Nombre"
                            name="name"
                            value={brand?.name ?? ''}
                            error={errors.name}
                        />
                        <Field
                            label="Slug"
                            name="slug"
                            value={brand?.slug ?? ''}
                            error={errors.slug}
                            placeholder="marca-tecnologica"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={brand?.description ?? ''}
                            rows={4}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Ruta del logo"
                            name="logo_path"
                            value={brand?.logo_path ?? ''}
                            error={errors.logo_path}
                            placeholder="/images/marcas/logo.webp"
                        />
                        <Field
                            label="Sitio web"
                            name="website_url"
                            value={brand?.website_url ?? ''}
                            error={errors.website_url}
                            placeholder="https://marca.com"
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Orden"
                            name="sort_order"
                            value={String(brand?.sort_order ?? 0)}
                            error={errors.sort_order}
                            type="number"
                        />
                        <div className="flex items-center gap-3 pt-7">
                            <input type="hidden" name="is_active" value="0" />
                            <input
                                id="is_active"
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked={brand?.is_active ?? true}
                                className="size-4 accent-lime-500"
                            />
                            <Label htmlFor="is_active">
                                Visible en el catálogo
                            </Label>
                        </div>
                    </div>
                    {brand?.logo_path && (
                        <div className="flex h-28 items-center justify-center rounded-xl border bg-white p-4">
                            <img
                                src={brand.logo_path}
                                alt={`Logo de ${brand.name}`}
                                className="max-h-full max-w-48 object-contain"
                            />
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-fit"
                    >
                        <Save /> {processing ? 'Guardando…' : 'Guardar marca'}
                    </Button>
                </>
            )}
        </Form>
    );
}

function Field({
    label,
    name,
    value,
    error,
    placeholder,
    type = 'text',
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={value}
                placeholder={placeholder}
            />
            <InputError message={error} />
        </div>
    );
}
