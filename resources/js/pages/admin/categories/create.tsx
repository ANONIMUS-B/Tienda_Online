import { Head } from '@inertiajs/react';
import CategoryForm from './category-form';
import { create, index } from '@/routes/admin/categories';
import type { ParentCategory } from '@/types/category';

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
            <div className="flex flex-col gap-6 p-4 md:p-8">
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
            </div>
        </>
    );
}

CreateCategory.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Categorías', href: index(props.currentTeam.slug) },
        { title: 'Nueva', href: create(props.currentTeam.slug) },
    ],
});
