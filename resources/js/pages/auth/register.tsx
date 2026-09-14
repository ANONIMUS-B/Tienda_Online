import { Form, Head, Link } from '@inertiajs/react';
import { Lock, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { TeamInvitationContext } from '@/types';

type Props = {
    passwordRules: string;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Register({ passwordRules, teamInvitation }: Props) {
    return (
        <>
            <Head title="Crear cuenta" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {teamInvitation && (
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Register"
                            />
                        )}

                        <div className="grid gap-5">
                            {/* Full Name */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                >
                                    <User className="size-3.5 text-lime-400" />{' '}
                                    Nombre Completo
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nombres y Apellidos"
                                    className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1 text-xs text-red-400"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                >
                                    <Mail className="size-3.5 text-lime-400" />{' '}
                                    Correo Electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="tu@correo.com"
                                    className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1 text-xs text-red-400"
                                />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                >
                                    <Lock className="size-3.5 text-lime-400" />{' '}
                                    Contraseña
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Crea una contraseña segura"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-1 text-xs text-red-400"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                >
                                    <ShieldCheck className="size-3.5 text-lime-400" />{' '}
                                    Confirmar Contraseña
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repite tu contraseña"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-1 text-xs text-red-400"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 text-sm font-extrabold text-black shadow-[0_0_25px_rgb(0_247_255/.35)] transition-all hover:scale-[1.01] hover:bg-lime-300 hover:shadow-[0_0_35px_rgb(0_247_255/.55)] active:scale-[0.99] disabled:opacity-50"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner className="size-5 text-black" />
                                ) : (
                                    <>
                                        <UserPlus className="size-4" />{' '}
                                        Registrar mi cuenta
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Sign in link */}
                        <div className="mt-4 text-center text-xs text-white/60">
                            ¿Ya tienes una cuenta registrada?{' '}
                            <Link
                                href={
                                    teamInvitation
                                        ? login.url({
                                              query: {
                                                  invitation:
                                                      teamInvitation.code,
                                              },
                                          })
                                        : login()
                                }
                                className="font-bold text-lime-400 transition hover:text-lime-300 hover:underline"
                                data-test="team-invitation-login-link"
                                tabIndex={6}
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Crea tu cuenta de cliente',
    description:
        'Únete para hacer pedidos, descargar software y gestionar tu soporte',
};
