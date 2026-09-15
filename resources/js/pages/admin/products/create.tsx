import { Head } from '@inertiajs/react';
import AdminFormModal from '@/components/admin/admin-form-modal';
import { create, index } from '@/routes/admin/products';
import ProductForm from './product-form';

export default function CreateProduct(props: { currentTeam: { slug: string }; categories: { id: number; name: string }[]; brands: { id: number; name: string }[] }) {
    return <><Head title="Nuevo producto" /><AdminFormModal title="Nuevo producto" description="Completa la información comercial, stock e imágenes." backHref={index(props.currentTeam.slug).url}><ProductForm {...props} /></AdminFormModal></>;
}

CreateProduct.layout = (props: { currentTeam: { slug: string } }) => ({ breadcrumbs: [{ title: 'Productos', href: index(props.currentTeam.slug) }, { title: 'Nuevo', href: create(props.currentTeam.slug) }] });
