import { Form, Head, Link } from '@inertiajs/react';
import { Lock, Mail, LogIn } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import type { TeamInvitationContext } from '@/types';

type Props = {
    status?: string;
    canResetPassword: boolean;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    return (
        <>
            <Head title="Iniciar sesión" />

            {teamInvitation && (
                <TeamInvitationAlert
                    invitation={teamInvitation}
                    action="Iniciar sesión"
                />
            )}

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-300 backdrop-blur-md">
                    {status}
                </div>
            )}

            <PasskeyVerify
                label="Ingresar con Passkey / Huella"
                loadingLabel="Autenticando..."
                separator="O ingresa con tu correo"
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email Field */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                >
                                    <Mail className="size-3.5 text-lime-400" />{' '}
                                    Correo Electrónico
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="tu@correo.com"
                                        className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-1 text-xs text-red-400"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                    >
                                        <Lock className="size-3.5 text-lime-400" />{' '}
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="text-xs font-semibold text-lime-400/90 transition hover:text-lime-300 hover:underline"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••••••"
                                    className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-1 text-xs text-red-400"
                                />
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center space-x-2.5 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-white/20 data-[state=checked]:bg-lime-400 data-[state=checked]:text-black"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-xs font-medium text-white/70 select-none hover:text-white"
                                >
                                    Recordar mi sesión en este equipo
                                </Label>
                            </div>

                            {/* Submit CTA Button */}
                            <Button
                                type="submit"
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 text-sm font-extrabold text-black shadow-[0_0_25px_rgb(0_247_255/.35)] transition-all hover:scale-[1.01] hover:bg-lime-300 hover:shadow-[0_0_35px_rgb(0_247_255/.55)] active:scale-[0.99] disabled:opacity-50"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="size-5 text-black" />
                                ) : (
                                    <>
                                        <LogIn className="size-4" /> Iniciar
                                        Sesión
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Sign up link */}
                        <div className="mt-4 text-center text-xs text-white/60">
                            ¿Aún no tienes una cuenta?{' '}
                            <Link
                                href={register({
                                    query: {
                                        invitation: teamInvitation?.code,
                                    },
                                })}
                                className="font-bold text-lime-400 transition hover:text-lime-300 hover:underline"
                                data-test="register-link"
                                tabIndex={5}
                            >
                                Crear una cuenta ahora
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: '¡Hola de nuevo!',
    description: 'Ingresa tus credenciales para acceder a tu panel y servicios',
};
