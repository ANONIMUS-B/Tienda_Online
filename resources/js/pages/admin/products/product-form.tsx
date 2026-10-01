import { Form, router } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    ImagePlus,
    Images,
    RefreshCw,
    Save,
    Sparkles,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/admin/products';
import { destroy as destroyProductImage } from '@/routes/admin/products/images';
import type { Product } from '@/types/product';

type Option = { id: number; name: string };

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateSkuClient(name: string, brandName?: string): string {
    const brandPart = brandName
        ? brandName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3)
        : '';

    const words = name.trim().split(/\s+/).filter(Boolean);
    let namePart = '';
    if (words.length > 0) {
        const initials = words
            .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0] || '')
            .join('')
            .toUpperCase();
        if (initials.length >= 2) {
            namePart = initials.slice(0, 4);
        } else {
            namePart = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);
        }
    }

    const parts = ['JB'];
    if (brandPart) parts.push(brandPart);
    if (namePart) parts.push(namePart);

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${parts.join('-')}-${random}`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function validateImageFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return `"${file.name}" no es una imagen válida (solo JPG, PNG o WEBP).`;
    }
    if (file.size > MAX_FILE_SIZE) {
        return `"${file.name}" supera el límite permitido de 12 MB (${formatBytes(file.size)}).`;
    }
    return null;
}

export default function ProductForm({
    currentTeam,
    product,
    categories,
    brands,
}: {
    currentTeam: { slug: string };
    product?: Product;
    categories: Option[];
    brands: Option[];
}) {
    const form = product
        ? update.form({ current_team: currentTeam.slug, product: product.slug })
        : store.form(currentTeam.slug);

    const specifications = product?.specifications
        ? Object.entries(product.specifications)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
        : '';
    const benefits = product?.benefits?.join('\n') ?? '';

    // Auto Slug & SKU states
    const [name, setName] = useState(product?.name ?? '');
    const [slug, setSlug] = useState(product?.slug ?? '');
    const [isSlugAuto, setIsSlugAuto] = useState(!product?.slug);
    const [sku, setSku] = useState(product?.sku ?? '');
    const [isSkuAuto, setIsSkuAuto] = useState(!product?.sku);
    const [brandId, setBrandId] = useState(String(product?.brand_id ?? ''));

    // Image Upload states
    const primaryInputRef = useRef<HTMLInputElement>(null);
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);
    const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
    const [primaryClientError, setPrimaryClientError] = useState<string | null>(null);
    const [isDraggingPrimary, setIsDraggingPrimary] = useState(false);

    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [galleryFiles, setGalleryFiles] = useState<Array<{ id: string; file: File; url: string }>>([]);
    const [galleryClientError, setGalleryClientError] = useState<string | null>(null);
    const [isDraggingGallery, setIsDraggingGallery] = useState(false);

    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

    // Initial SKU generation for new products
    useEffect(() => {
        if (!product && !sku && isSkuAuto) {
            const brandObj = brands.find((b) => String(b.id) === brandId);
            setSku(generateSkuClient(name || 'Nuevo', brandObj?.name));
        }
    }, []);

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            if (primaryPreview) URL.revokeObjectURL(primaryPreview);
            galleryFiles.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, []);

    // Name change handler
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (isSlugAuto) {
            setSlug(slugify(val));
        }
        if (isSkuAuto) {
            const brandObj = brands.find((b) => String(b.id) === brandId);
            setSku(generateSkuClient(val, brandObj?.name));
        }
    };

    // Brand change handler
    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newBrandId = e.target.value;
        setBrandId(newBrandId);
        if (isSkuAuto) {
            const brandObj = brands.find((b) => String(b.id) === newBrandId);
            setSku(generateSkuClient(name, brandObj?.name));
        }
    };

    // Primary image handler
    const handlePrimaryFileSelect = (file?: File) => {
        if (!file) return;
        const err = validateImageFile(file);
        if (err) {
            setPrimaryClientError(err);
            if (primaryInputRef.current) primaryInputRef.current.value = '';
            return;
        }
        setPrimaryClientError(null);
        if (primaryPreview) URL.revokeObjectURL(primaryPreview);
        setPrimaryFile(file);
        setPrimaryPreview(URL.createObjectURL(file));
    };

    const clearPrimaryImage = () => {
        if (primaryPreview) URL.revokeObjectURL(primaryPreview);
        setPrimaryPreview(null);
        setPrimaryFile(null);
        setPrimaryClientError(null);
        if (primaryInputRef.current) primaryInputRef.current.value = '';
    };

    const handlePrimaryDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPrimary(false);
        const file = e.dataTransfer.files?.[0];
        if (file && primaryInputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            primaryInputRef.current.files = dt.files;
            handlePrimaryFileSelect(file);
        }
    };

    // Gallery handlers
    const syncGalleryInput = (items: Array<{ file: File }>) => {
        if (!galleryInputRef.current) return;
        const dt = new DataTransfer();
        items.forEach((item) => dt.items.add(item.file));
        galleryInputRef.current.files = dt.files;
    };

    const handleGalleryFilesSelect = (files: FileList | File[]) => {
        const fileList = Array.from(files);
        if (fileList.length === 0) return;

        const currentSavedGalleryCount = product?.images?.filter((img) => !img.is_primary).length ?? 0;
        const maxAllowed = 8;
        const remainingSlots = maxAllowed - currentSavedGalleryCount - galleryFiles.length;

        if (remainingSlots <= 0) {
            setGalleryClientError(`Límite alcanzado: máximo ${maxAllowed} imágenes en la galería.`);
            return;
        }

        const newItems: Array<{ id: string; file: File; url: string }> = [];
        const errors: string[] = [];

        for (const file of fileList) {
            if (newItems.length >= remainingSlots) {
                errors.push(`Se omitieron imágenes adicionales por exceder el máximo de ${maxAllowed}.`);
                break;
            }
            const err = validateImageFile(file);
            if (err) {
                errors.push(err);
            } else {
                newItems.push({
                    id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
                    file,
                    url: URL.createObjectURL(file),
                });
            }
        }

        if (errors.length > 0) {
            setGalleryClientError(errors.join(' '));
        } else {
            setGalleryClientError(null);
        }

        if (newItems.length > 0) {
            const updated = [...galleryFiles, ...newItems];
            setGalleryFiles(updated);
            syncGalleryInput(updated);
        }
    };

    const removeGalleryItem = (id: string) => {
        const itemToRemove = galleryFiles.find((i) => i.id === id);
        if (itemToRemove) {
            URL.revokeObjectURL(itemToRemove.url);
        }
        const updated = galleryFiles.filter((i) => i.id !== id);
        setGalleryFiles(updated);
        syncGalleryInput(updated);
        setGalleryClientError(null);
    };

    const handleGalleryDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingGallery(false);
        if (e.dataTransfer.files?.length) {
            handleGalleryFilesSelect(e.dataTransfer.files);
        }
    };

    const handleDeleteImage = (imageId: number) => {
        if (!product) return;
        if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) return;

        setDeletingImageId(imageId);
        router.delete(
            destroyProductImage.url({
                current_team: currentTeam.slug,
                product: product.slug,
                image: imageId,
            }),
            {
                preserveScroll: true,
                onFinish: () => setDeletingImageId(null),
            }
        );
    };

    const currentPrimaryImage = product?.images?.find((img) => img.is_primary);
    const existingGalleryImages = product?.images?.filter((img) => !img.is_primary) ?? [];

    return (
        <Form
            {...form}
            encType="multipart/form-data"
            className="bg-card grid gap-6 rounded-xl border p-5 sm:p-7"
        >
            {({ errors, processing, progress }) => (
                <>
                    {/* Identification Section: Name, Slug, SKU */}
                    <div className="grid gap-5 md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Nombre del producto <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="Ej: Autodesk AutoCAD 2026"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="slug">Slug (URL amigable)</Label>
                                {isSlugAuto ? (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] font-normal border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 py-0 h-5"
                                    >
                                        <Check className="size-3 mr-1" /> Automático
                                    </Badge>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSlugAuto(true);
                                            setSlug(slugify(name));
                                        }}
                                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="size-3" /> Auto
                                    </button>
                                )}
                            </div>
                            <Input
                                id="slug"
                                name="slug"
                                type="text"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setIsSlugAuto(false);
                                }}
                                placeholder="autodesk-autocad-2026"
                            />
                            <p className="text-[11px] text-muted-foreground truncate">
                                URL: <span className="font-mono text-foreground/80">/productos/{slug || '...'}</span>
                            </p>
                            <InputError message={errors.slug} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="sku">SKU (Código único)</Label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const brandObj = brands.find((b) => String(b.id) === brandId);
                                        setSku(generateSkuClient(name || 'PRD', brandObj?.name));
                                    }}
                                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                                    title="Generar un nuevo código SKU aleatorio"
                                >
                                    <Sparkles className="size-3" /> Generar SKU
                                </button>
                            </div>
                            <Input
                                id="sku"
                                name="sku"
                                type="text"
                                value={sku}
                                onChange={(e) => {
                                    setSku(e.target.value.toUpperCase());
                                    setIsSkuAuto(false);
                                }}
                                placeholder="JB-AUT-1024"
                                className="font-mono uppercase"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Identificador de inventario único
                            </p>
                            <InputError message={errors.sku} />
                        </div>
                    </div>

                    {/* Classification: Type, Category, Brand */}
                    <div className="grid gap-5 md:grid-cols-3">
                        <Select
                            label="Tipo"
                            name="type"
                            value={product?.type ?? 'physical'}
                            error={errors.type}
                            options={[
                                ['physical', 'Físico'],
                                ['digital', 'Digital'],
                                ['license', 'Licencia'],
                                ['software', 'Software'],
                                ['service', 'Servicio'],
                                ['application', 'Aplicación'],
                            ]}
                        />
                        <Select
                            label="Categoría"
                            name="category_id"
                            value={String(product?.category_id ?? '')}
                            error={errors.category_id}
                            options={categories.map((item) => [String(item.id), item.name])}
                        />
                        <Select
                            label="Marca"
                            name="brand_id"
                            value={brandId}
                            onChange={handleBrandChange}
                            error={errors.brand_id}
                            options={[['', 'Sin marca'], ...brands.map((item) => [String(item.id), item.name])]}
                        />
                    </div>

                    {/* Descriptions & Specs */}
                    <Field
                        label="Descripción corta"
                        name="short_description"
                        value={product?.short_description ?? ''}
                        error={errors.short_description}
                    />
                    <TextArea
                        label="Descripción completa"
                        name="description"
                        value={product?.description ?? ''}
                        error={errors.description}
                    />
                    <TextArea
                        label="Especificaciones (una por línea: Característica: valor)"
                        name="specifications_text"
                        value={specifications}
                        error={errors.specifications_text}
                    />
                    <TextArea
                        label="Beneficios (uno por línea)"
                        name="benefits_text"
                        value={benefits}
                        error={errors.benefits_text}
                    />

                    {/* Commercial Info */}
                    <div className="grid gap-5 md:grid-cols-3">
                        <Field
                            label="Garantía"
                            name="warranty_info"
                            value={product?.warranty_info ?? ''}
                            error={errors.warranty_info}
                        />
                        <Field
                            label="Envío"
                            name="shipping_info"
                            value={product?.shipping_info ?? ''}
                            error={errors.shipping_info}
                        />
                        <Field
                            label="Métodos de pago"
                            name="payment_info"
                            value={product?.payment_info ?? ''}
                            error={errors.payment_info}
                        />
                    </div>

                    {/* Pricing and Stock */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <Field
                            label="Precio"
                            name="price"
                            value={product?.price ?? ''}
                            error={errors.price}
                            type="number"
                        />
                        <Field
                            label="Precio promocional"
                            name="promotional_price"
                            value={product?.promotional_price ?? ''}
                            error={errors.promotional_price}
                            type="number"
                        />
                        <Field
                            label="Stock"
                            name="stock"
                            value={String(product?.stock ?? 0)}
                            error={errors.stock}
                            type="number"
                        />
                        <Field
                            label="Stock mínimo"
                            name="minimum_stock"
                            value={String(product?.minimum_stock ?? 5)}
                            error={errors.minimum_stock}
                            type="number"
                        />
                    </div>

                    {/* Image Uploading Zones */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Primary Image Zone */}
                        <div className="grid gap-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="primary_image" className="font-medium text-sm">
                                    Imagen principal{' '}
                                    {product ? (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (opcional al editar)
                                        </span>
                                    ) : (
                                        <span className="text-destructive">*</span>
                                    )}
                                </Label>
                                {primaryFile && (
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {formatBytes(primaryFile.size)}
                                    </span>
                                )}
                            </div>

                            {/* Hidden native input */}
                            <input
                                ref={primaryInputRef}
                                id="primary_image"
                                name="primary_image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handlePrimaryFileSelect(e.target.files?.[0])}
                                className="sr-only"
                            />

                            {/* Primary Image Preview if newly selected */}
                            {primaryPreview ? (
                                <div className="relative border rounded-xl p-3 bg-muted/30 flex items-center gap-4">
                                    <div className="relative size-20 shrink-0 rounded-lg overflow-hidden border bg-background">
                                        <img
                                            src={primaryPreview}
                                            alt="Vista previa principal"
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                                                Nueva imagen
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-medium truncate mt-1">
                                            {primaryFile?.name}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {primaryFile ? formatBytes(primaryFile.size) : ''}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => primaryInputRef.current?.click()}
                                            >
                                                Cambiar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                                onClick={clearPrimaryImage}
                                            >
                                                <X className="size-3.5 mr-1" /> Quitar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : currentPrimaryImage ? (
                                /* When editing and has existing primary image */
                                <div className="relative border rounded-xl p-3 bg-muted/20 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative size-16 shrink-0 rounded-lg overflow-hidden border bg-background">
                                            <img
                                                src={currentPrimaryImage.path}
                                                alt={currentPrimaryImage.alt_text ?? 'Principal'}
                                                className="size-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <Badge variant="secondary" className="text-[10px]">
                                                Imagen actual
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                Se mantendrá si no seleccionas otra
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs shrink-0"
                                        onClick={() => primaryInputRef.current?.click()}
                                    >
                                        <UploadCloud className="size-3.5 mr-1.5" /> Reemplazar
                                    </Button>
                                </div>
                            ) : (
                                /* Empty state dropzone */
                                <div
                                    onClick={() => primaryInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDraggingPrimary(true);
                                    }}
                                    onDragLeave={() => setIsDraggingPrimary(false)}
                                    onDrop={handlePrimaryDrop}
                                    className={cn(
                                        'cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-center transition-colors bg-muted/10 hover:bg-muted/30',
                                        isDraggingPrimary ? 'border-primary bg-primary/5' : 'border-border'
                                    )}
                                >
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <UploadCloud className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-foreground">
                                            Haz clic o arrastra la imagen principal aquí
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            PNG, JPG, JPEG o WEBP · Máximo 12 MB
                                        </p>
                                    </div>
                                </div>
                            )}

                            {primaryClientError && (
                                <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
                                    <AlertCircle className="size-3.5 shrink-0" /> {primaryClientError}
                                </p>
                            )}
                            <InputError message={errors.primary_image} />
                        </div>

                        {/* Gallery Upload Zone */}
                        <div className="grid gap-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="gallery" className="font-medium text-sm">
                                    Galería adicional (máximo 8)
                                </Label>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {existingGalleryImages.length + galleryFiles.length} / 8 imágenes
                                </span>
                            </div>

                            {/* Hidden native gallery input */}
                            <input
                                ref={galleryInputRef}
                                id="gallery"
                                name="gallery[]"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(e) => e.target.files && handleGalleryFilesSelect(e.target.files)}
                                className="sr-only"
                            />

                            {/* Gallery Dropzone */}
                            <div
                                onClick={() => galleryInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDraggingGallery(true);
                                }}
                                onDragLeave={() => setIsDraggingGallery(false)}
                                onDrop={handleGalleryDrop}
                                className={cn(
                                    'cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-center transition-colors bg-muted/10 hover:bg-muted/30',
                                    isDraggingGallery ? 'border-primary bg-primary/5' : 'border-border'
                                )}
                            >
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Images className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-foreground">
                                        Haz clic o arrastra fotos adicionales
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        PNG, JPG o WEBP · Máx. 12 MB por foto
                                    </p>
                                </div>
                            </div>

                            {/* Pending Gallery Previews */}
                            {galleryFiles.length > 0 && (
                                <div className="space-y-1.5 mt-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Fotos listas para subir ({galleryFiles.length}):
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {galleryFiles.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group relative border rounded-lg overflow-hidden bg-muted/20"
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={item.file.name}
                                                    className="w-full h-20 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryItem(item.id)}
                                                    className="absolute top-1 right-1 size-5 rounded-md bg-destructive text-destructive-foreground flex items-center justify-center shadow opacity-90 hover:opacity-100 transition-opacity"
                                                    title="Quitar imagen"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                                <div className="p-1 bg-background/95 text-[10px] truncate">
                                                    <p className="truncate font-medium">{item.file.name}</p>
                                                    <p className="text-muted-foreground font-mono">
                                                        {formatBytes(item.file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {galleryClientError && (
                                <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
                                    <AlertCircle className="size-3.5 shrink-0" /> {galleryClientError}
                                </p>
                            )}
                            <InputError message={errors.gallery} />
                        </div>
                    </div>

                    {/* Existing Gallery Images (when editing) */}
                    {product?.images && product.images.length > 0 && (
                        <div className="grid gap-2 border-t pt-4">
                            <Label className="text-sm font-medium">
                                Imágenes guardadas en la tienda ({product.images.length})
                            </Label>
                            <div className="flex flex-wrap gap-3">
                                {product.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="group relative size-24 rounded-xl border overflow-hidden bg-muted"
                                    >
                                        <img
                                            src={image.path}
                                            alt={image.alt_text ?? ''}
                                            className="h-full w-full object-cover"
                                        />
                                        {image.is_primary && (
                                            <span className="absolute bottom-1 left-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                                                Principal
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(image.id)}
                                            disabled={deletingImageId === image.id}
                                            title="Eliminar imagen permanentemente"
                                            className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-lg bg-destructive text-destructive-foreground opacity-90 transition-opacity hover:opacity-100 group-hover:opacity-100 shadow-sm disabled:opacity-50"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Checkboxes: Publication flags */}
                    <div className="grid gap-3 sm:grid-cols-4">
                        {[
                            ['is_active', 'Publicado', product?.is_active ?? true],
                            ['is_featured', 'Destacado', product?.is_featured ?? false],
                            ['is_bestseller', 'Más vendido', product?.is_bestseller ?? false],
                            ['is_new', 'Nuevo', product?.is_new ?? true],
                        ].map(([propName, label, checked]) => (
                            <label
                                key={String(propName)}
                                className="flex items-center gap-2 rounded-xl border p-3 text-sm cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                                <input
                                    type="hidden"
                                    name={String(propName)}
                                    value="0"
                                />
                                <input
                                    type="checkbox"
                                    name={String(propName)}
                                    value="1"
                                    defaultChecked={Boolean(checked)}
                                    className="size-4 accent-lime-500 rounded cursor-pointer"
                                />
                                <span>{String(label)}</span>
                            </label>
                        ))}
                    </div>

                    {progress && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subiendo archivos…</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <progress
                                value={progress.percentage}
                                max="100"
                                className="w-full h-2 rounded overflow-hidden"
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-fit cursor-pointer"
                    >
                        <Save className="mr-1.5 size-4" />{' '}
                        {processing ? 'Guardando producto…' : 'Guardar producto'}
                    </Button>
                </>
            )}
        </Form>
    );
}

function Field({
    label,
    name,
    value,
    error,
    type = 'text',
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
    type?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                step={type === 'number' ? '0.01' : undefined}
                defaultValue={value}
            />
            <InputError message={error} />
        </div>
    );
}

function TextArea({
    label,
    name,
    value,
    error,
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <textarea
                id={name}
                name={name}
                defaultValue={value}
                rows={4}
                className="border-input rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <InputError message={error} />
        </div>
    );
}

function Select({
    label,
    name,
    value,
    error,
    options,
    onChange,
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
    options: string[][];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <select
                id={name}
                name={name}
                defaultValue={onChange ? undefined : value}
                value={onChange ? value : undefined}
                onChange={onChange}
                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
                {options.map(([key, text]) => (
                    <option key={key} value={key} className="bg-popover text-popover-foreground">
                        {text}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}
