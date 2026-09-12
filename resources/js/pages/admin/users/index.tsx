import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/users';

type ManagedUser = { id: number; name: string; email: string; role: string; is_active: boolean; created_at: string };
type Paginator = { data: ManagedUser[]; links: { url: string | null; label: string; active: boolean }[] };

export default function UsersIndex({ users, filters, currentTeam, auth }: { users: Paginator; filters: { q?: string }; currentTeam: { slug: string }; auth: { user: { id: number; role: string } } }) {
    const isAdmin = auth.user.role === 'admin';
    return <>
        <Head title="Usuarios y roles" />
        <div className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex items-center justify-between gap-4">
                <div><h1 className="text-2xl font-semibold">Usuarios y roles</h1><p className="text-sm text-muted-foreground">Control de administradores, subadministradores y clientes.</p></div>
                {isAdmin && <Button asChild><Link href={create(currentTeam.slug)}><Plus /> Crear usuario</Link></Button>}
            </div>
            <form action={index(currentTeam.slug).url} method="get" className="relative max-w-lg">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input name="q" defaultValue={filters.q} placeholder="Buscar nombre o correo" className="w-full rounded-md border bg-transparent py-2 pr-3 pl-10" />
            </form>
            <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/40 text-left"><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4">Estado</th><th className="p-4">Registro</th><th className="p-4" /></tr></thead><tbody>
                {users.data.map((user) => <tr key={user.id} className="border-b"><td className="p-4"><b>{user.name}</b><small className="block text-muted-foreground">{user.email}</small></td><td className="p-4 capitalize">{user.role === 'user' ? 'Cliente' : user.role}</td><td className="p-4">{user.is_active ? 'Activo' : 'Inactivo'}</td><td className="p-4">{new Date(user.created_at).toLocaleDateString('es-PE')}</td><td className="p-4"><div className="flex justify-end gap-2">{isAdmin && <><Button size="icon" variant="outline" asChild><Link href={edit({ current_team: currentTeam.slug, user: user.id })}><Pencil /></Link></Button>{auth.user.id !== user.id && <Button size="icon" variant="destructive" asChild><Link href={destroy({ current_team: currentTeam.slug, user: user.id })} method="delete" as="button" onBefore={() => window.confirm(`¿Eliminar ${user.name}?`)}><Trash2 /></Link></Button>}</>}</div></td></tr>)}
            </tbody></table></div>
            <div className="flex flex-wrap justify-center gap-2">{users.links.map((link, i) => link.url ? <Link key={i} href={link.url} className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : null)}</div>
        </div>
    </>;
}
UsersIndex.layout = (props: { currentTeam: { slug: string } }) => ({ breadcrumbs: [{ title: 'Usuarios', href: index(props.currentTeam.slug) }] });
