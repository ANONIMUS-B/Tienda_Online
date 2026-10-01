import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Download,
    FileSpreadsheet,
    FileUp,
    Loader2,
    Package,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
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
import { create, destroy, edit, index } from '@/routes/admin/products';
import type { Product } from '@/types/product';

type ProductPaginator = {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
};

function ConfirmDeleteDialog({
    open,
    onOpenChange,
    productName,
    loading,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
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
                            ¿Eliminar producto del inventario?
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-left text-sm text-muted-foreground pt-1">
                        ¿Estás seguro de que deseas eliminar permanentemente "{productName}"? Esta acción removerá el producto y sus imágenes del catálogo.
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
                        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Sí, eliminar producto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ProductsIndex({
    products,
    currentTeam,
    filters,
}: {
    products: ProductPaginator;
    currentTeam: { slug: string };
    filters?: { q?: string };
}) {
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? '');
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Debounced dynamic live search per keystroke
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

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) {
            return;
        }

        post(`/${currentTeam.slug}/administracion/productos/importar`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsImportOpen(false);
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingProduct) {
            return;
        }

        setIsDeleting(true);
        router.delete(
            destroy({
                current_team: currentTeam.slug,
                product: deletingProduct.slug,
            }).url,
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setDeletingProduct(null);
                },
            },
        );
    };

    const formatPaginationLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('&laquo;')) {
            return '« Anterior';
        }
        if (label.includes('Next') || label.includes('&raquo;')) {
            return 'Siguiente »';
        }
        return label;
    };

    const templateDownloadUrl = `/${currentTeam.slug}/administracion/productos/plantilla-importacion`;
    const exportInventoryUrl = `/${currentTeam.slug}/administracion/productos/exportar`;

    return (
        <>
            <Head title="Productos e Inventario" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Productos e Inventario</h1>
                        <p className="text-muted-foreground text-sm">
                            Catálogo general, existencias, exportación e importación masiva.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Download Template */}
                        <Button variant="outline" asChild>
                            <a
                                href={templateDownloadUrl}
                                download="plantilla_productos_inventario.csv"
                                title="Descargar plantilla CSV con formato y ejemplos"
                            >
                                <Download className="mr-2 size-4" />
                                Descargar plantilla
                            </a>
                        </Button>

                        {/* Export Inventory */}
                        <Button variant="outline" asChild>
                            <a
                                href={exportInventoryUrl}
                                download="inventario_completo.csv"
                                title="Exportar todo el inventario de productos a CSV"
                            >
                                <FileSpreadsheet className="mr-2 size-4 text-emerald-600" />
                                Exportar inventario
                            </a>
                        </Button>

                        {/* Import Excel / CSV */}
                        <Button
                            variant="secondary"
                            onClick={() => {
                                clearErrors();
                                setIsImportOpen(true);
                            }}
                        >
                            <FileUp className="mr-2 size-4 text-primary" />
                            Importar Excel / CSV
                        </Button>

                        {/* New Product */}
                        <Button asChild>
                            <Link href={create(currentTeam.slug)}>
                                <Plus className="mr-2 size-4" /> Nuevo producto
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Import Modal */}
                <Dialog
                    open={isImportOpen}
                    onOpenChange={(open) => {
                        if (!processing) {
                            setIsImportOpen(open);
                            if (!open) {
                                reset();
                                clearErrors();
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <FileSpreadsheet className="size-6 text-emerald-600" />
                                Importación Masiva de Productos
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Carga un archivo Excel (.xlsx, .xls) o CSV (.csv) con tu catálogo.
                                Si el SKU ya existe, los datos (precios, existencias, especificaciones) se actualizarán; si no existe, se creará un producto nuevo.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
                            <p className="font-semibold text-foreground">
                                Columnas reconocidas en la plantilla:
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                                <div><code className="text-primary font-semibold">nombre</code> (obligatorio)</div>
                                <div><code className="text-primary font-semibold">sku</code> (obligatorio/auto)</div>
                                <div><code className="text-primary font-semibold">precio</code> (obligatorio)</div>
                                <div><code className="text-primary font-semibold">stock</code> (obligatorio)</div>
                                <div><code className="text-primary">categoria</code></div>
                                <div><code className="text-primary">marca</code></div>
                                <div><code className="text-primary">tipo</code> (license/physical)</div>
                                <div><code className="text-primary">precio_oferta</code></div>
                                <div><code className="text-primary">stock_minimo</code></div>
                                <div><code className="text-primary">especificaciones</code></div>
                                <div><code className="text-primary">beneficios</code></div>
                                <div><code className="text-primary">descripcion</code></div>
                            </div>
                            <p className="text-[11px] text-muted-foreground/80 pt-1">
                                * Nota de especificaciones: sepáralas con | (ejemplo: <code>RAM: 16 GB | Disco: 512 GB SSD</code>).
                            </p>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <div
                                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/10"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="mb-2 size-8 text-muted-foreground" />
                                    <span className="font-medium text-sm">
                                        Haz clic para seleccionar el archivo Excel o CSV
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        Formatos soportados: .xlsx, .xls, .csv (máximo 20 MB)
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            setData('file', file);
                                            clearErrors();
                                        }}
                                    />
                                </div>

                                {data.file && (
                                    <div className="flex items-center justify-between rounded-lg border bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                                            <span className="font-medium truncate">{data.file.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({(data.file.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs hover:bg-emerald-500/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setData('file', null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            Quitar
                                        </Button>
                                    </div>
                                )}

                                {errors.file && (
                                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                                        <AlertCircle className="size-4 shrink-0" />
                                        <span>{errors.file}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <a
                                    href={templateDownloadUrl}
                                    download="plantilla_productos_inventario.csv"
                                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                >
                                    <Download className="size-3.5" />
                                    Descargar plantilla con datos de ejemplo
                                </a>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsImportOpen(false);
                                        reset();
                                        clearErrors();
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Importando catálogo...
                                        </>
                                    ) : (
                                        'Procesar e Importar'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Confirm Delete Floating Dialog */}
                <ConfirmDeleteDialog
                    open={!!deletingProduct}
                    onOpenChange={(open) => {
                        if (!open && !isDeleting) {
                            setDeletingProduct(null);
                        }
                    }}
                    productName={deletingProduct?.name ?? ''}
                    loading={isDeleting}
                    onConfirm={confirmDelete}
                />

                {/* Live Dynamic Search Bar with Floating Suggestions */}
                <div ref={searchContainerRef} className="relative w-full max-w-lg">
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
                            placeholder="Buscar en tiempo real por nombre, SKU, marca o categoría..."
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
                    {showSuggestions && searchQuery.trim().length > 0 && products.data.length > 0 && (
                        <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl border bg-card p-2 shadow-xl">
                            <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground border-b mb-1">
                                <span className="font-semibold text-foreground">
                                    Sugerencias instantáneas ({products.data.length})
                                </span>
                                <span className="text-[10px]">Escribe para filtrar la tabla</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-1">
                                {products.data.slice(0, 5).map((p) => (
                                    <Link
                                        key={p.id}
                                        href={edit({
                                            current_team: currentTeam.slug,
                                            product: p.slug,
                                        }).url}
                                        className="flex items-center justify-between rounded-lg p-2 text-xs hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            {p.images[0] ? (
                                                <img
                                                    src={p.images[0].path}
                                                    alt=""
                                                    className="size-8 rounded-md object-cover border"
                                                />
                                            ) : (
                                                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <Package className="size-4" />
                                                </div>
                                            )}
                                            <div className="truncate">
                                                <p className="font-medium text-foreground truncate">{p.name}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono">{p.sku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <span className="font-semibold text-foreground">
                                                S/ {p.promotional_price ?? p.price}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground font-medium">
                                                {p.stock} un.
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Table */}
                <div className="bg-card overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b text-left">
                                <th className="p-4">Producto</th>
                                <th className="p-4">Categoría / Marca</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground p-12 text-center"
                                    >
                                        <Package className="mx-auto mb-3 size-10" />
                                        {searchQuery ? (
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    No se encontraron productos para "{searchQuery}"
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Prueba buscando con otro término o SKU.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    Limpiar búsqueda
                                                </Button>
                                            </div>
                                        ) : (
                                            'No hay productos registrados'
                                        )}
                                    </td>
                                </tr>
                            )}
                            {products.data.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-muted/20">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.images[0] ? (
                                                <img
                                                    src={product.images[0].path}
                                                    alt={product.name}
                                                    className="size-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                    <Package className="size-6" />
                                                </div>
                                            )}
                                            <div>
                                                <b className="font-medium text-foreground">{product.name}</b>
                                                <p className="text-muted-foreground text-xs font-mono">
                                                    {product.sku}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium">{product.category?.name ?? 'Sin categoría'}</span>
                                        <br />
                                        <span className="text-muted-foreground text-xs">
                                            {product.brand?.name ?? 'Sin marca'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold">
                                            S/{' '}
                                            {product.promotional_price ??
                                                product.price}
                                        </div>
                                        {product.promotional_price && (
                                            <span className="text-muted-foreground text-xs line-through">
                                                S/ {product.price}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                product.stock <= 3
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}
                                        >
                                            {product.stock} un.
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                product.is_active
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {product.is_active
                                                ? 'Publicado'
                                                : 'Oculto'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                asChild
                                                title="Editar producto"
                                            >
                                                <Link
                                                    href={edit({
                                                        current_team:
                                                            currentTeam.slug,
                                                        product: product.slug,
                                                    })}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => setDeletingProduct(product)}
                                                title="Eliminar producto"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Spanish Pagination */}
                {products.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                        {products.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveScroll
                                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-primary font-medium text-primary-foreground border-primary'
                                            : 'bg-card text-foreground hover:bg-muted'
                                    }`}
                                >
                                    {formatPaginationLabel(link.label)}
                                </Link>
                            ) : (
                                <span
                                    key={index}
                                    className="rounded-md border border-transparent px-3 py-1.5 text-sm text-muted-foreground/50 cursor-not-allowed"
                                >
                                    {formatPaginationLabel(link.label)}
                                </span>
                            ),
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

ProductsIndex.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Productos', href: index(props.currentTeam.slug) }],
});
