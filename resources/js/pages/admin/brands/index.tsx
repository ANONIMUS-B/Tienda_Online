import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BadgeCheck,
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
import { create, destroy, edit, index } from '@/routes/admin/brands';
import type { BrandSummary } from '@/types/brand';

function ConfirmDeleteBrandDialog({
    open,
    onOpenChange,
    brandName,
    loading,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brandName: string;
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
                            ¿Eliminar marca?
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-left text-sm text-muted-foreground pt-1">
                        ¿Estás seguro de que deseas eliminar permanentemente "{brandName}"? Esta acción removerá la marca del catálogo.
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
                            'Eliminar marca'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function BrandsIndex({
    brands,
    currentTeam,
    filters,
}: {
    brands: BrandSummary[];
    currentTeam: { slug: string };
    filters?: { q?: string };
}) {
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? '');
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [deletingBrand, setDeletingBrand] = useState<BrandSummary | null>(null);
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
        if (!deletingBrand) return;
        setIsDeleting(true);
        router.delete(
            destroy({
                current_team: currentTeam.slug,
                brand: deletingBrand.slug,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingBrand(null);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Marcas" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Marcas</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Gestiona los fabricantes disponibles en el catálogo.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create(currentTeam.slug)}>
                            <Plus /> Nueva marca
                        </Link>
                    </Button>
                </div>

                {/* Floating Delete Confirmation Dialog */}
                <ConfirmDeleteBrandDialog
                    open={!!deletingBrand}
                    onOpenChange={(open) => {
                        if (!open && !isDeleting) {
                            setDeletingBrand(null);
                        }
                    }}
                    brandName={deletingBrand?.name ?? ''}
                    loading={isDeleting}
                    onConfirm={confirmDelete}
                />

                {/* Live Dynamic Search Bar with Floating Suggestions */}
                <div ref={searchContainerRef} className="relative w-full max-w-md">
                    <div className="relative flex items-center">
                        <Search className="text-muted-foreground absolute left-3 top-3 size-4 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Buscar en tiempo real por nombre o sitio web..."
                            className="w-full rounded-xl border bg-card py-2.5 pr-10 pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {isSearching ? (
                            <Loader2 className="absolute right-3 top-3 size-4 animate-spin text-muted-foreground" />
                        ) : searchQuery ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setShowSuggestions(false);
                                }}
                                className="absolute right-3 top-3 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                title="Limpiar búsqueda"
                            >
                                <X className="size-4" />
                            </button>
                        ) : null}
                    </div>

                    {/* Floating live suggestion dropdown */}
                    {showSuggestions && searchQuery.trim().length > 0 && brands.length > 0 && (
                        <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl border bg-card p-2 shadow-xl">
                            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground border-b mb-1">
                                <span className="font-semibold text-foreground">
                                    Sugerencias instantáneas ({brands.length})
                                </span>
                                <span className="text-[10px]">Escribe para filtrar la tabla</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {brands.slice(0, 5).map((b) => (
                                    <Link
                                        key={b.id}
                                        href={edit({
                                            current_team: currentTeam.slug,
                                            brand: b.slug,
                                        }).url}
                                        className="flex items-center justify-between rounded-lg p-2 text-xs hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            {b.logo_path ? (
                                                <img
                                                    src={b.logo_path}
                                                    alt=""
                                                    className="size-7 rounded-md bg-white object-contain p-0.5 border shrink-0"
                                                />
                                            ) : (
                                                <div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-bold shrink-0">
                                                    {b.name.slice(0, 1)}
                                                </div>
                                            )}
                                            <div className="truncate">
                                                <p className="font-medium text-foreground truncate">{b.name}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    /{b.slug} {b.website_url ? `· ${b.website_url}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <span
                                                className={
                                                    b.is_active
                                                        ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 font-medium'
                                                        : 'rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-500 font-medium'
                                                }
                                            >
                                                {b.is_active ? 'Activa' : 'Oculta'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-card overflow-hidden rounded-xl border">
                    {brands.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-12 text-center">
                            <BadgeCheck className="text-muted-foreground size-10" />
                            {searchQuery ? (
                                <div>
                                    <p className="font-medium text-foreground">
                                        No se encontraron marcas para "{searchQuery}"
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
                                <p className="font-medium">Todavía no hay marcas</p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 border-b text-left">
                                    <tr>
                                        <th className="px-5 py-3">Marca</th>
                                        <th className="px-5 py-3">Sitio web</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3">Orden</th>
                                        <th className="px-5 py-3 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brands.map((brand) => (
                                        <tr
                                            key={brand.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {brand.logo_path ? (
                                                        <img
                                                            src={
                                                                brand.logo_path
                                                            }
                                                            alt=""
                                                            className="size-10 rounded-lg bg-white object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="bg-muted flex size-10 items-center justify-center rounded-lg font-bold">
                                                            {brand.name.slice(
                                                                0,
                                                                1,
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">
                                                            {brand.name}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            /{brand.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted-foreground px-5 py-4">
                                                {brand.website_url ?? '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={
                                                        brand.is_active
                                                            ? 'rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600'
                                                            : 'rounded-full bg-zinc-500/10 px-2 py-1 text-xs text-zinc-500'
                                                    }
                                                >
                                                    {brand.is_active
                                                        ? 'Activa'
                                                        : 'Oculta'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {brand.sort_order}
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
                                                                brand: brand.slug,
                                                            })}
                                                            aria-label={`Editar ${brand.name}`}
                                                        >
                                                            <Pencil />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => setDeletingBrand(brand)}
                                                        aria-label={`Eliminar ${brand.name}`}
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

BrandsIndex.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Marcas', href: index(props.currentTeam.slug) }],
});
