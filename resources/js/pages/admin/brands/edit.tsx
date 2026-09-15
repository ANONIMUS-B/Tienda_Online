import { Head } from '@inertiajs/react';
import BrandForm from './brand-form';
import { edit, index } from '@/routes/admin/brands';
import type { BrandSummary } from '@/types/brand';
import AdminFormModal from '@/components/admin/admin-form-modal';

export default function EditBrand({
    currentTeam,
    brand,
}: {
    currentTeam: { slug: string };
    brand: BrandSummary;
}) {
    return (
        <>
            <Head title={`Editar ${brand.name}`} />
            <AdminFormModal title="Editar marca" backHref={index(currentTeam.slug).url}>
                <div>
                    <h1 className="text-2xl font-semibold">Editar marca</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Actualiza la identidad, visibilidad y orden del
                        fabricante.
                    </p>
                </div>
                <BrandForm currentTeam={currentTeam} brand={brand} />
            </AdminFormModal>
        </>
    );
}
EditBrand.layout = (props: {
    currentTeam: { slug: string };
    brand: BrandSummary;
}) => ({
    breadcrumbs: [
        { title: 'Marcas', href: index(props.currentTeam.slug) },
        {
            title: props.brand.name,
            href: edit({
                current_team: props.currentTeam.slug,
                brand: props.brand.slug,
            }),
        },
    ],
});
