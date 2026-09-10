import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/admin/products';
import type { Product } from '@/types/product';

type Option = { id: number; name: string };
export default function ProductForm({
    currentTeam,
    product,
    categories,
    brands,
}: {
    currentTeam: { slug: string };
    product?: Product;
    categories: Option[];
    brands: Option[];
}) {
    const form = product
        ? update.form({ current_team: currentTeam.slug, product: product.slug })
        : store.form(currentTeam.slug);
    const specifications = product?.specifications
        ? Object.entries(product.specifications)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
        : '';
    return (
        <Form
            {...form}
            className="bg-card grid gap-6 rounded-xl border p-5 sm:p-7"
        >
            {({ errors, processing, progress }) => (
                <>
                    <div className="grid gap-5 md:grid-cols-3">
                        <Field
                            label="Nombre"
                            name="name"
                            value={product?.name ?? ''}
                            error={errors.name}
                        />
                        <Field
                            label="Slug"
                            name="slug"
                            value={product?.slug ?? ''}
                            error={errors.slug}
                        />
                        <Field
                            label="SKU"
                            name="sku"
                            value={product?.sku ?? ''}
                            error={errors.sku}
                        />
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        <Select
                            label="Tipo"
                            name="type"
                            value={product?.type ?? 'physical'}
                            error={errors.type}
                            options={[
                                ['physical', 'Físico'],
                                ['digital', 'Digital'],
                                ['license', 'Licencia'],
                                ['software', 'Software'],
                                ['service', 'Servicio'],
                                ['application', 'Aplicación'],
                            ]}
                        />
                        <Select
                            label="Categoría"
                            name="category_id"
                            value={String(product?.category_id ?? '')}
                            error={errors.category_id}
                            options={categories.map((item) => [
                                String(item.id),
                                item.name,
                            ])}
                        />
                        <Select
                            label="Marca"
                            name="brand_id"
                            value={String(product?.brand_id ?? '')}
                            error={errors.brand_id}
                            options={[
                                ['', 'Sin marca'],
                                ...brands.map((item) => [
                                    String(item.id),
                                    item.name,
                                ]),
                            ]}
                        />
                    </div>
                    <Field
                        label="Descripción corta"
                        name="short_description"
                        value={product?.short_description ?? ''}
                        error={errors.short_description}
                    />
                    <TextArea
                        label="Descripción completa"
                        name="description"
                        value={product?.description ?? ''}
                        error={errors.description}
                    />
                    <TextArea
                        label="Especificaciones (una por línea: Característica: valor)"
                        name="specifications_text"
                        value={specifications}
                        error={errors.specifications_text}
                    />
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <Field
                            label="Precio"
                            name="price"
                            value={product?.price ?? ''}
                            error={errors.price}
                            type="number"
                        />
                        <Field
                            label="Precio promocional"
                            name="promotional_price"
                            value={product?.promotional_price ?? ''}
                            error={errors.promotional_price}
                            type="number"
                        />
                        <Field
                            label="Stock"
                            name="stock"
                            value={String(product?.stock ?? 0)}
                            error={errors.stock}
                            type="number"
                        />
                        <Field
                            label="Stock mínimo"
                            name="minimum_stock"
                            value={String(product?.minimum_stock ?? 5)}
                            error={errors.minimum_stock}
                            type="number"
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="primary_image">
                                Imagen principal{' '}
                                {product ? '(opcional al editar)' : ''}
                            </Label>
                            <Input
                                id="primary_image"
                                name="primary_image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                            />
                            <InputError message={errors.primary_image} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gallery">Galería (máximo 8)</Label>
                            <Input
                                id="gallery"
                                name="gallery[]"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                            />
                            <InputError message={errors.gallery} />
                        </div>
                    </div>
                    {product?.images.length ? (
                        <div className="flex flex-wrap gap-3">
                            {product.images.map((image) => (
                                <img
                                    key={image.id}
                                    src={image.path}
                                    alt=""
                                    className="size-24 rounded-xl border object-cover"
                                />
                            ))}
                        </div>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-4">
                        {[
                            [
                                'is_active',
                                'Publicado',
                                product?.is_active ?? true,
                            ],
                            [
                                'is_featured',
                                'Destacado',
                                product?.is_featured ?? false,
                            ],
                            [
                                'is_bestseller',
                                'Más vendido',
                                product?.is_bestseller ?? false,
                            ],
                            ['is_new', 'Nuevo', product?.is_new ?? true],
                        ].map(([name, label, checked]) => (
                            <label
                                key={String(name)}
                                className="flex items-center gap-2 rounded-xl border p-3 text-sm"
                            >
                                <input
                                    type="hidden"
                                    name={String(name)}
                                    value="0"
                                />
                                <input
                                    type="checkbox"
                                    name={String(name)}
                                    value="1"
                                    defaultChecked={Boolean(checked)}
                                    className="size-4 accent-lime-500"
                                />
                                {String(label)}
                            </label>
                        ))}
                    </div>
                    {progress && (
                        <progress
                            value={progress.percentage}
                            max="100"
                            className="w-full"
                        />
                    )}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-fit"
                    >
                        <Save />{' '}
                        {processing ? 'Guardando…' : 'Guardar producto'}
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
    type = 'text',
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
    type?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                step={type === 'number' ? '0.01' : undefined}
                defaultValue={value}
            />
            <InputError message={error} />
        </div>
    );
}
function TextArea({
    label,
    name,
    value,
    error,
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <textarea
                id={name}
                name={name}
                defaultValue={value}
                rows={4}
                className="border-input rounded-md border bg-transparent px-3 py-2 text-sm"
            />
            <InputError message={error} />
        </div>
    );
}
function Select({
    label,
    name,
    value,
    error,
    options,
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
    options: string[][];
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <select
                id={name}
                name={name}
                defaultValue={value}
                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
            >
                {options.map(([key, text]) => (
                    <option key={key} value={key}>
                        {text}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}
