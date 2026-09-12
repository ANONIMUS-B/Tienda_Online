import { Head, Link } from '@inertiajs/react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/products';
import type { Product } from '@/types/product';

type ProductPaginator = {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
};

export default function ProductsIndex({
    products,
    currentTeam,
}: {
    products: ProductPaginator;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Productos" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Productos</h1>
                        <p className="text-muted-foreground text-sm">
                            Catálogo, precios, inventario e imágenes.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create(currentTeam.slug)}>
                            <Plus /> Nuevo producto
                        </Link>
                    </Button>
                </div>
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
                                        No hay productos
                                    </td>
                                </tr>
                            )}
                            {products.data.map((product) => (
                                <tr key={product.id} className="border-b">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.images[0] && (
                                                <img
                                                    src={product.images[0].path}
                                                    alt=""
                                                    className="size-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <b>{product.name}</b>
                                                <p className="text-muted-foreground text-xs">
                                                    {product.sku}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {product.category?.name}
                                        <br />
                                        <span className="text-muted-foreground">
                                            {product.brand?.name ?? 'Sin marca'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        S/{' '}
                                        {product.promotional_price ??
                                            product.price}
                                    </td>
                                    <td className="p-4">{product.stock}</td>
                                    <td className="p-4">
                                        {product.is_active
                                            ? 'Publicado'
                                            : 'Oculto'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={edit({
                                                        current_team:
                                                            currentTeam.slug,
                                                        product: product.slug,
                                                    })}
                                                >
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                asChild
                                            >
                                                <Link
                                                    href={destroy({
                                                        current_team:
                                                            currentTeam.slug,
                                                        product: product.slug,
                                                    })}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() =>
                                                        window.confirm(
                                                            `¿Eliminar ${product.name}?`,
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
                <div className="flex flex-wrap justify-center gap-2">
                    {products.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`rounded-lg border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : null,
                    )}
                </div>
            </div>
        </>
    );
}
ProductsIndex.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Productos', href: index(props.currentTeam.slug) }],
});
