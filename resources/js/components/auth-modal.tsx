import { Form, Link } from '@inertiajs/react';
import { Lock, LogIn, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { store as loginStore } from '@/routes/login';
import { request as passwordRequest } from '@/routes/password';
import { store as registerStore } from '@/routes/register';

export type AuthModalMode = 'login' | 'register';

type AuthModalProps = {
    mode: AuthModalMode | null;
    onModeChange: (mode: AuthModalMode | null) => void;
};

const inputClassName =
    'h-11 w-full rounded-xl border border-cyan-900/15 bg-cyan-50/45 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35';

export default function AuthModal({ mode, onModeChange }: AuthModalProps) {
    const isLogin = mode === 'login';

    return (
        <Dialog
            open={mode !== null}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onModeChange(null);
                }
            }}
        >
            <DialogContent className="store-light max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] overflow-y-auto rounded-3xl border-cyan-200 bg-white p-0 shadow-[0_24px_80px_rgba(8,145,178,.25)] sm:max-w-md">
                <div className="border-b border-cyan-100 bg-gradient-to-br from-cyan-50 to-white px-5 py-5 pr-14 sm:px-7">
                    <DialogHeader>
                        <p className="text-xs font-black tracking-[.18em] text-cyan-500 uppercase">
                            JB Techline
                        </p>
                        <DialogTitle className="text-2xl font-black text-slate-900">
                            {isLogin
                                ? 'Bienvenido nuevamente'
                                : 'Crea tu cuenta'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {isLogin
                                ? 'Ingresa para gestionar tus compras y pedidos.'
                                : 'Regístrate para comprar y seguir tus pedidos.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-5 py-5 sm:px-7 sm:py-6">
                    {isLogin ? (
                        <Form
                            {...loginStore.form()}
                            resetOnSuccess={['password']}
                            className="grid gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <Mail className="size-4 text-cyan-500" />
                                            Correo electrónico
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="tu@correo.com"
                                            className={inputClassName}
                                        />
                                        <InputError message={errors.email} />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <Lock className="size-4 text-cyan-500" />
                                            Contraseña
                                        </span>
                                        <PasswordInput
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            placeholder="Ingresa tu contraseña"
                                            className={inputClassName}
                                        />
                                        <InputError message={errors.password} />
                                    </label>

                                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <label className="flex items-center gap-2 text-slate-600">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                className="size-4 rounded border-cyan-200 accent-cyan-400"
                                            />
                                            Recordar sesión
                                        </label>
                                        <Link
                                            href={passwordRequest()}
                                            className="font-bold text-cyan-600 hover:text-cyan-700"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-300/35 transition hover:bg-cyan-300 disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <LogIn className="size-5" />
                                        )}
                                        {processing
                                            ? 'Ingresando…'
                                            : 'Ingresar'}
                                    </button>
                                </>
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...registerStore.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            disableWhileProcessing
                            className="grid gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <User className="size-4 text-cyan-500" />
                                            Nombre completo
                                        </span>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            autoComplete="name"
                                            placeholder="Nombres y apellidos"
                                            className={inputClassName}
                                        />
                                        <InputError message={errors.name} />
                                    </label>

                                    <div className="grid grid-cols-[110px_1fr] gap-3">
                                        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                            Documento
                                            <select name="document_type" required defaultValue="dni" className={inputClassName}>
                                                <option value="dni">DNI</option>
                                                <option value="ruc">RUC</option>
                                            </select>
                                        </label>
                                        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                            Número
                                            <input name="document_number" required inputMode="numeric" placeholder="DNI o RUC" className={inputClassName} />
                                            <InputError message={errors.document_number} />
                                        </label>
                                    </div>

                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        Dirección
                                        <input name="address" required autoComplete="street-address" placeholder="Dirección de entrega o fiscal" className={inputClassName} />
                                        <InputError message={errors.address} />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <Mail className="size-4 text-cyan-500" />
                                            Correo electrónico
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            placeholder="tu@correo.com"
                                            className={inputClassName}
                                        />
                                        <InputError message={errors.email} />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <Lock className="size-4 text-cyan-500" />
                                            Contraseña
                                        </span>
                                        <PasswordInput
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Crea una contraseña segura"
                                            className={inputClassName}
                                        />
                                        <InputError message={errors.password} />
                                    </label>

                                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="size-4 text-cyan-500" />
                                            Confirmar contraseña
                                        </span>
                                        <PasswordInput
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Repite tu contraseña"
                                            className={inputClassName}
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-300/35 transition hover:bg-cyan-300 disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <UserPlus className="size-5" />
                                        )}
                                        {processing
                                            ? 'Creando cuenta…'
                                            : 'Crear cuenta'}
                                    </button>
                                </>
                            )}
                        </Form>
                    )}

                    <p className="mt-5 text-center text-sm text-slate-500">
                        {isLogin
                            ? '¿Aún no tienes una cuenta?'
                            : '¿Ya tienes una cuenta?'}{' '}
                        <button
                            type="button"
                            onClick={() =>
                                onModeChange(isLogin ? 'register' : 'login')
                            }
                            className="font-black text-cyan-600 hover:text-cyan-700"
                        >
                            {isLogin ? 'Crear cuenta' : 'Ingresar'}
                        </button>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
