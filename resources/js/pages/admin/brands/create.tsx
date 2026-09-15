import { Head } from '@inertiajs/react';
import BrandForm from './brand-form';
import { create, index } from '@/routes/admin/brands';
import AdminFormModal from '@/components/admin/admin-form-modal';

export default function CreateBrand({
    currentTeam,
}: {
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Nueva marca" />
            <AdminFormModal title="Nueva marca" backHref={index(currentTeam.slug).url}>
                <div>
                    <h1 className="text-2xl font-semibold">Nueva marca</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Registra un fabricante para utilizarlo en los productos.
                    </p>
                </div>
                <BrandForm currentTeam={currentTeam} />
            </AdminFormModal>
        </>
    );
}
CreateBrand.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Marcas', href: index(props.currentTeam.slug) },
        { title: 'Nueva', href: create(props.currentTeam.slug) },
    ],
});
