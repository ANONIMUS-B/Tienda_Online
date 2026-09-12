import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Recuperar contraseña" />

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-300 backdrop-blur-md">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
                                >
                                    <Mail className="size-3.5 text-lime-400" /> Correo Electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="tu@correo.com"
                                    className="h-11 rounded-xl border-white/14 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-lime-400/80 focus:bg-black/40 focus:ring-2 focus:ring-lime-400/30"
                                />
                                <InputError message={errors.email} className="mt-1 text-xs text-red-400" />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 text-sm font-extrabold text-black shadow-[0_0_25px_rgba(163,230,53,0.3)] transition-all hover:scale-[1.01] hover:bg-lime-300 hover:shadow-[0_0_35px_rgba(163,230,53,0.5)] active:scale-[0.99] disabled:opacity-50"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? (
                                    <Spinner className="size-5 text-black" />
                                ) : (
                                    <>
                                        <Send className="size-4" /> Enviar enlace de recuperación
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="mt-4 text-center text-xs text-white/60">
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-1.5 font-bold text-lime-400 transition hover:text-lime-300 hover:underline"
                            >
                                <ArrowLeft className="size-3.5" /> Volver a iniciar sesión
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Recuperar contraseña',
    description: 'Ingresa tu correo registrado para recibir un enlace seguro de restablecimiento',
};
