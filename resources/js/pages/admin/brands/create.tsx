import { Head } from '@inertiajs/react';
import BrandForm from './brand-form';
import { create, index } from '@/routes/admin/brands';

export default function CreateBrand({
    currentTeam,
}: {
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Nueva marca" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">Nueva marca</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Registra un fabricante para utilizarlo en los productos.
                    </p>
                </div>
                <BrandForm currentTeam={currentTeam} />
            </div>
        </>
    );
}
CreateBrand.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Marcas', href: index(props.currentTeam.slug) },
        { title: 'Nueva', href: create(props.currentTeam.slug) },
    ],
});
