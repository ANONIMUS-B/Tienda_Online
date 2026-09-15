import { Head } from '@inertiajs/react';
import CategoryForm from './category-form';
import { edit, index } from '@/routes/admin/categories';
import type { CategorySummary, ParentCategory } from '@/types/category';
import AdminFormModal from '@/components/admin/admin-form-modal';

export default function EditCategory({
    currentTeam,
    category,
    parentCategories,
}: {
    currentTeam: { slug: string };
    category: CategorySummary;
    parentCategories: ParentCategory[];
}) {
    return (
        <>
            <Head title={`Editar ${category.name}`} />
            <AdminFormModal title="Editar categoría" backHref={index(currentTeam.slug).url}>
                <div>
                    <h1 className="text-2xl font-semibold">Editar categoría</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Actualiza su presentación, jerarquía y visibilidad.
                    </p>
                </div>
                <CategoryForm
                    currentTeam={currentTeam}
                    category={category}
                    parentCategories={parentCategories}
                />
            </AdminFormModal>
        </>
    );
}

EditCategory.layout = (props: {
    currentTeam: { slug: string };
    category: CategorySummary;
}) => ({
    breadcrumbs: [
        { title: 'Categorías', href: index(props.currentTeam.slug) },
        {
            title: props.category.name,
            href: edit({
                current_team: props.currentTeam.slug,
                category: props.category.slug,
            }),
        },
    ],
});
