import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type RoleOption = { value: string; label: string };
type ManagedUser = {
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

export default function UserForm({
    action,
    method,
    roles,
    user,
}: {
    action: string;
    method: 'post' | 'put';
    roles: RoleOption[];
    user?: ManagedUser;
}) {
    return (
        <Form action={action} method={method} className="grid max-w-2xl gap-5">
            {({ errors, processing }) => (
                <>
                    <label className="grid gap-2 text-sm font-medium">
                        Nombre
                        <input name="name" defaultValue={user?.name} className="rounded-md border bg-transparent p-3" required />
                        {errors.name && <small className="text-destructive">{errors.name}</small>}
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                        Correo electrónico
                        <input name="email" type="email" defaultValue={user?.email} className="rounded-md border bg-transparent p-3" required />
                        {errors.email && <small className="text-destructive">{errors.email}</small>}
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                        {user ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                        <input name="password" type="password" className="rounded-md border bg-transparent p-3" required={!user} />
                        {errors.password && <small className="text-destructive">{errors.password}</small>}
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                        Confirmar contraseña
                        <input name="password_confirmation" type="password" className="rounded-md border bg-transparent p-3" required={!user} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                        Rol
                        <select name="role" defaultValue={user?.role ?? 'user'} className="rounded-md border bg-background p-3">
                            {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                        </select>
                        {errors.role && <small className="text-destructive">{errors.role}</small>}
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium">
                        <input type="hidden" name="is_active" value="0" />
                        <input type="checkbox" name="is_active" value="1" defaultChecked={user?.is_active ?? true} />
                        Usuario activo
                    </label>
                    <Button disabled={processing}>{processing ? 'Guardando...' : 'Guardar usuario'}</Button>
                </>
            )}
        </Form>
    );
}
