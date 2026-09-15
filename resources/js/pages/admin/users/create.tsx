import { Head } from '@inertiajs/react';
import AdminFormModal from '@/components/admin/admin-form-modal';
import UserForm from '@/components/admin/user-form';
import { index, store } from '@/routes/admin/users';

export default function CreateUser({ roles, currentTeam }: { roles: { value: string; label: string }[]; currentTeam: { slug: string } }) {
    return <><Head title="Crear usuario" /><AdminFormModal title="Crear usuario" description="Asigna su acceso desde el primer momento." backHref={index(currentTeam.slug).url}><UserForm action={store(currentTeam.slug).url} method="post" roles={roles} /></AdminFormModal></>;
}
CreateUser.layout = (props: { currentTeam: { slug: string } }) => ({ breadcrumbs: [{ title: 'Usuarios', href: index(props.currentTeam.slug) }, { title: 'Crear', href: '#' }] });
