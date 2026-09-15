import { Head } from '@inertiajs/react';
import CategoryForm from './category-form';
import { create, index } from '@/routes/admin/categories';
import type { ParentCategory } from '@/types/category';
import AdminFormModal from '@/components/admin/admin-form-modal';

export default function CreateCategory({
    currentTeam,
    parentCategories,
}: {
    currentTeam: { slug: string };
    parentCategories: ParentCategory[];
}) {
    return (
        <>
            <Head title="Nueva categoría" />
            <AdminFormModal title="Nueva categoría" backHref={index(currentTeam.slug).url}>
                <div>
                    <h1 className="text-2xl font-semibold">Nueva categoría</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Crea una categoría principal o selecciona un nivel
                        superior.
                    </p>
                </div>
                <CategoryForm
                    currentTeam={currentTeam}
                    parentCategories={parentCategories}
                />
            </AdminFormModal>
        </>
    );
}

CreateCategory.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Categorías', href: index(props.currentTeam.slug) },
        { title: 'Nueva', href: create(props.currentTeam.slug) },
    ],
});
