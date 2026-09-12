import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, edit, index } from '@/routes/admin/software';
import type { SoftwareProgram } from '@/types/software';

type ProgramPaginator = {
    data: SoftwareProgram[];
    links: { url: string | null; label: string; active: boolean }[];
};

export default function Index({
    programs,
    currentTeam,
}: {
    programs: ProgramPaginator;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Software" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Programas y software
                        </h1>
                        <p className="text-muted-foreground">
                            Archivos descargables, sistemas y aplicaciones
                            propias.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create(currentTeam.slug)}>
                            <Plus />
                            Nuevo programa
                        </Link>
                    </Button>
                </div>
                <div className="bg-card rounded-xl border">
                    {programs.data.map((p) => (
                        <Link
                            key={p.id}
                            href={edit({
                                current_team: currentTeam.slug,
                                software_program: p.slug,
                            })}
                            className="flex justify-between border-b p-4"
                        >
                            <span>
                                <b>{p.name}</b>
                                <small className="text-muted-foreground block">
                                    {p.category} · {p.platform}
                                </small>
                            </span>
                            <span>{p.is_active ? 'Publicado' : 'Oculto'}</span>
                        </Link>
                    ))}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {programs.links.map((link, linkIndex) =>
                        link.url ? (
                            <Link
                                key={linkIndex}
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
Index.layout = (p: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [{ title: 'Software', href: index(p.currentTeam.slug) }],
});
