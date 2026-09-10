import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/admin/categories';
import type { CategorySummary, ParentCategory } from '@/types/category';

export default function CategoryForm({
    currentTeam,
    category,
    parentCategories,
}: {
    currentTeam: { slug: string };
    category?: CategorySummary;
    parentCategories: ParentCategory[];
}) {
    const form = category
        ? update.form({
              current_team: currentTeam.slug,
              category: category.slug,
          })
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
                            value={category?.name ?? ''}
                            error={errors.name}
                        />
                        <Field
                            label="Slug"
                            name="slug"
                            value={category?.slug ?? ''}
                            error={errors.slug}
                            placeholder="laptops-y-computadoras"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">Categoría principal</Label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            defaultValue={category?.parent_id ?? ''}
                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            <option value="">Sin categoría principal</option>
                            {parentCategories.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.parent_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={category?.description ?? ''}
                            rows={4}
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">Imagen</Label>
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                        />
                        <InputError message={errors.image} />
                        {category?.image_path && (
                            <img
                                src={category.image_path}
                                alt="Imagen actual"
                                className="h-28 w-44 rounded-xl object-cover"
                            />
                        )}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Orden"
                            name="sort_order"
                            value={String(category?.sort_order ?? 0)}
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
                                defaultChecked={category?.is_active ?? true}
                                className="size-4 accent-lime-500"
                            />
                            <Label htmlFor="is_active">
                                Visible en el catálogo
                            </Label>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-fit"
                    >
                        <Save />{' '}
                        {processing ? 'Guardando…' : 'Guardar categoría'}
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
