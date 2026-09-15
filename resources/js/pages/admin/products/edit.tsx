import { Head } from '@inertiajs/react';
import AdminFormModal from '@/components/admin/admin-form-modal';
import { edit, index } from '@/routes/admin/products';
import type { Product } from '@/types/product';
import ProductForm from './product-form';

export default function EditProduct(props: { currentTeam: { slug: string }; product: Product; categories: { id: number; name: string }[]; brands: { id: number; name: string }[] }) {
    return <><Head title={`Editar ${props.product.name}`} /><AdminFormModal title="Editar producto" description="Actualiza catálogo, inventario e imágenes." backHref={index(props.currentTeam.slug).url}><ProductForm {...props} /></AdminFormModal></>;
}

EditProduct.layout = (props: { currentTeam: { slug: string }; product: Product }) => ({ breadcrumbs: [{ title: 'Productos', href: index(props.currentTeam.slug) }, { title: props.product.name, href: edit({ current_team: props.currentTeam.slug, product: props.product.slug }) }] });
