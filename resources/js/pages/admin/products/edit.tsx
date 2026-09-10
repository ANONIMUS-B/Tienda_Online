import { Head } from '@inertiajs/react';
import ProductForm from './product-form';
import { edit, index } from '@/routes/admin/products';
import type { Product } from '@/types/product';
export default function EditProduct(props: {
    currentTeam: { slug: string };
    product: Product;
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title={`Editar ${props.product.name}`} />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">Editar producto</h1>
                    <p className="text-muted-foreground text-sm">
                        Actualiza catálogo, inventario e imágenes.
                    </p>
                </div>
                <ProductForm {...props} />
            </div>
        </>
    );
}
EditProduct.layout = (props: {
    currentTeam: { slug: string };
    product: Product;
}) => ({
    breadcrumbs: [
        { title: 'Productos', href: index(props.currentTeam.slug) },
        {
            title: props.product.name,
            href: edit({
                current_team: props.currentTeam.slug,
                product: props.product.slug,
            }),
        },
    ],
});
