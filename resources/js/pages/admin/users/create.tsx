import { Head } from '@inertiajs/react';
import UserForm from '@/components/admin/user-form';
import { index, store } from '@/routes/admin/users';

export default function CreateUser({ roles, currentTeam }: { roles: { value: string; label: string }[]; currentTeam: { slug: string } }) {
    return <><Head title="Crear usuario" /><div className="flex flex-col gap-6 p-4 md:p-8"><div><h1 className="text-2xl font-semibold">Crear usuario</h1><p className="text-sm text-muted-foreground">Asigna su acceso desde el primer momento.</p></div><UserForm action={store(currentTeam.slug).url} method="post" roles={roles} /></div></>;
}
CreateUser.layout = (props: { currentTeam: { slug: string } }) => ({ breadcrumbs: [{ title: 'Usuarios', href: index(props.currentTeam.slug) }, { title: 'Crear', href: '#' }] });
