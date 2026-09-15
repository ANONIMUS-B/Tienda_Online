import { Head } from '@inertiajs/react';
import AdminFormModal from '@/components/admin/admin-form-modal';
import UserForm from '@/components/admin/user-form';
import { index, update } from '@/routes/admin/users';

type ManagedUser = { id: number; name: string; email: string; role: string; is_active: boolean };
export default function EditUser({ managedUser, roles, currentTeam }: { managedUser: ManagedUser; roles: { value: string; label: string }[]; currentTeam: { slug: string } }) {
    return <><Head title={`Editar ${managedUser.name}`} /><AdminFormModal title="Editar usuario" description="Actualiza sus datos, contraseña, rol o estado." backHref={index(currentTeam.slug).url}><UserForm action={update({ current_team: currentTeam.slug, user: managedUser.id }).url} method="put" roles={roles} user={managedUser} /></AdminFormModal></>;
}
EditUser.layout = (props: { currentTeam: { slug: string } }) => ({ breadcrumbs: [{ title: 'Usuarios', href: index(props.currentTeam.slug) }, { title: 'Editar', href: '#' }] });
