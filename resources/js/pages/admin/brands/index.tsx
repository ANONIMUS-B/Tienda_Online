import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/brands';
import type { BrandSummary } from '@/types/brand';

export default function BrandsIndex({
    brands,
    currentTeam,
}: {
    brands: BrandSummary[];
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Marcas" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between gap-4">
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
                <div className="bg-card overflow-hidden rounded-xl border">
                    {brands.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-12 text-center">
                            <BadgeCheck className="text-muted-foreground size-10" />
                            <p className="font-medium">Todavía no hay marcas</p>
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
                                                        asChild
                                                    >
                                                        <Link
                                                            href={destroy({
                                                                current_team:
                                                                    currentTeam.slug,
                                                                brand: brand.slug,
                                                            })}
                                                            method="delete"
                                                            as="button"
                                                            onBefore={() =>
                                                                window.confirm(
                                                                    `¿Eliminar ${brand.name}?`,
                                                                )
                                                            }
                                                            aria-label={`Eliminar ${brand.name}`}
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
BrandsIndex.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Marcas', href: index(props.currentTeam.slug) }],
});
