import { Head, Link } from '@inertiajs/react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/categories';
import type { CategorySummary } from '@/types/category';

export default function CategoriesIndex({
    categories,
    currentTeam,
}: {
    categories: CategorySummary[];
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Categorías" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Categorías</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Organiza el catálogo mediante categorías y
                            subcategorías.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create(currentTeam.slug)}>
                            <Plus /> Nueva categoría
                        </Link>
                    </Button>
                </div>
                <div className="bg-card overflow-hidden rounded-xl border">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-12 text-center">
                            <FolderTree className="text-muted-foreground size-10" />
                            <p className="font-medium">
                                Todavía no hay categorías
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 border-b text-left">
                                    <tr>
                                        <th className="px-5 py-3">Categoría</th>
                                        <th className="px-5 py-3">Nivel</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3">Orden</th>
                                        <th className="px-5 py-3 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium">
                                                    {category.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    /{category.slug}
                                                    {category.children_count
                                                        ? ` · ${category.children_count} subcategorías`
                                                        : ''}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                {category.parent?.name ??
                                                    'Principal'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={
                                                        category.is_active
                                                            ? 'rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600'
                                                            : 'rounded-full bg-zinc-500/10 px-2 py-1 text-xs text-zinc-500'
                                                    }
                                                >
                                                    {category.is_active
                                                        ? 'Activa'
                                                        : 'Oculta'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {category.sort_order}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit({
                                                                current_team:
                                                                    currentTeam.slug,
                                                                category:
                                                                    category.slug,
                                                            })}
                                                            aria-label={`Editar ${category.name}`}
                                                        >
                                                            <Pencil />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={destroy({
                                                                current_team:
                                                                    currentTeam.slug,
                                                                category:
                                                                    category.slug,
                                                            })}
                                                            method="delete"
                                                            as="button"
                                                            aria-label={`Eliminar ${category.name}`}
                                                            onBefore={() =>
                                                                window.confirm(
                                                                    `¿Eliminar ${category.name}?`,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CategoriesIndex.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Categorías', href: index(props.currentTeam.slug) }],
});
