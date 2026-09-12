import { Head } from '@inertiajs/react';
import UserForm from '@/components/admin/user-form';
import { index, update } from '@/routes/admin/users';

type ManagedUser = { id: number; name: string; email: string; role: string; is_active: boolean };
export default function EditUser({ managedUser, roles, currentTeam }: { managedUser: ManagedUser; roles: { value: string; label: string }[]; currentTeam: { slug: string } }) {
    return <><Head title={`Editar ${managedUser.name}`} /><div className="flex flex-col gap-6 p-4 md:p-8"><div><h1 className="text-2xl font-semibold">Editar usuario</h1><p className="text-sm text-muted-foreground">Actualiza sus datos, contraseña, rol o estado.</p></div><UserForm action={update({ current_team: currentTeam.slug, user: managedUser.id }).url} method="put" roles={roles} user={managedUser} /></div></>;
}
EditUser.layout = (props: { currentTeam: { slug: string } }) => ({ breadcrumbs: [{ title: 'Usuarios', href: index(props.currentTeam.slug) }, { title: 'Editar', href: '#' }] });
