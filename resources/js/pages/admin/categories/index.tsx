import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    FolderTree,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { create, destroy, edit, index } from '@/routes/admin/categories';
import type { CategorySummary } from '@/types/category';

function ConfirmDeleteCategoryDialog({
    open,
    onOpenChange,
    categoryName,
    loading,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryName: string;
    loading: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <AlertTriangle className="size-5" />
                        </div>
                        <DialogTitle className="text-left text-lg font-semibold">
                            ¿Eliminar categoría?
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-left text-sm text-muted-foreground pt-1">
                        ¿Estás seguro de que deseas eliminar permanentemente "{categoryName}"? Esta acción removerá la categoría del catálogo.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar categoría'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function CategoriesIndex({
    categories,
    currentTeam,
    filters,
}: {
    categories: CategorySummary[];
    currentTeam: { slug: string };
    filters?: { q?: string };
}) {
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? '');
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<CategorySummary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchQuery === (filters?.q ?? '')) {
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                index(currentTeam.slug).url,
                searchQuery.trim() ? { q: searchQuery.trim() } : {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                },
            );
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close floating suggestions dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const confirmDelete = () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        router.delete(
            destroy({
                current_team: currentTeam.slug,
                category: deletingCategory.slug,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingCategory(null);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Categorías" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Categorías</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Organiza el catálogo mediante categorías y subcategorías.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create(currentTeam.slug)}>
                            <Plus /> Nueva categoría
                        </Link>
                    </Button>
                </div>

                {/* Floating Delete Confirmation Dialog */}
                <ConfirmDeleteCategoryDialog
                    open={!!deletingCategory}
                    onOpenChange={(open) => {
                        if (!open && !isDeleting) {
                            setDeletingCategory(null);
                        }
                    }}
                    categoryName={deletingCategory?.name ?? ''}
                    loading={isDeleting}
                    onConfirm={confirmDelete}
                />

                {/* Live Dynamic Search Bar with Floating Suggestions */}
                <div ref={searchContainerRef} className="relative w-full max-w-md">
                    <div className="relative flex items-center">
                        <Search className="text-muted-foreground absolute left-3 size-4 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Buscar en tiempo real por nombre, slug o descripción..."
                            className="w-full rounded-xl border bg-card py-2.5 pr-10 pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {isSearching ? (
                            <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
                        ) : searchQuery ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setShowSuggestions(false);
                                }}
                                className="absolute right-3 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                title="Limpiar búsqueda"
                            >
                                <X className="size-4" />
                            </button>
                        ) : null}
                    </div>

                    {/* Floating live suggestion dropdown */}
                    {showSuggestions && searchQuery.trim().length > 0 && categories.length > 0 && (
                        <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl border bg-card p-2 shadow-xl">
                            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground border-b mb-1">
                                <span className="font-semibold text-foreground">
                                    Sugerencias instantáneas ({categories.length})
                                </span>
                                <span className="text-[10px]">Escribe para filtrar la tabla</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {categories.slice(0, 5).map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={edit({
                                            current_team: currentTeam.slug,
                                            category: cat.slug,
                                        }).url}
                                        className="flex items-center justify-between rounded-lg p-2 text-xs hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                                                <FolderTree className="size-3.5" />
                                            </div>
                                            <div className="truncate">
                                                <p className="font-medium text-foreground truncate">{cat.name}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    /{cat.slug} {cat.children_count ? `· ${cat.children_count} subcat.` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <span
                                                className={
                                                    cat.is_active
                                                        ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 font-medium'
                                                        : 'rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-500 font-medium'
                                                }
                                            >
                                                {cat.is_active ? 'Activa' : 'Oculta'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-card overflow-hidden rounded-xl border">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-12 text-center">
                            <FolderTree className="text-muted-foreground size-10" />
                            {searchQuery ? (
                                <div>
                                    <p className="font-medium text-foreground">
                                        No se encontraron categorías para "{searchQuery}"
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Limpiar búsqueda
                                    </Button>
                                </div>
                            ) : (
                                <p className="font-medium">
                                    Todavía no hay categorías
                                </p>
                            )}
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
                                                        onClick={() => setDeletingCategory(category)}
                                                        aria-label={`Eliminar ${category.name}`}
                                                    >
                                                        <Trash2 />
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
