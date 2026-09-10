import { Head } from '@inertiajs/react';
import ProductForm from './product-form';
import { create, index } from '@/routes/admin/products';
export default function CreateProduct(props: {
    currentTeam: { slug: string };
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title="Nuevo producto" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">Nuevo producto</h1>
                    <p className="text-muted-foreground text-sm">
                        Completa la información comercial, stock e imágenes.
                    </p>
                </div>
                <ProductForm {...props} />
            </div>
        </>
    );
}
CreateProduct.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Productos', href: index(props.currentTeam.slug) },
        { title: 'Nuevo', href: create(props.currentTeam.slug) },
    ],
});
