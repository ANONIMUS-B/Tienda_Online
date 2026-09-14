import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
}: Props = {}) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <>
            <div className="grid gap-2">
                <button
                    type="button"
                    onClick={verify}
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-lime-400/35 bg-lime-400/10 px-4 text-xs font-extrabold tracking-wide text-lime-300 transition-all hover:border-lime-400 hover:bg-lime-400/20 hover:text-white hover:shadow-[0_0_20px_rgb(0_247_255/.3)] active:scale-[0.99] disabled:opacity-50"
                >
                    {isLoading ? (
                        <Spinner className="size-4 text-lime-300" />
                    ) : (
                        <KeyRound className="size-4 text-lime-400" />
                    )}
                    {isLoading
                        ? (loadingLabel ?? 'Autenticando...')
                        : (label ?? 'Ingresar con Passkey / Huella')}
                </button>
                {error && (
                    <InputError
                        message={error}
                        className="text-center text-xs text-red-400"
                    />
                )}
            </div>

            <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/12" />
                </div>
                <div className="border-brand-support/20 bg-brand-background text-brand-support relative z-10 rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase shadow-md">
                    {separator ?? 'O ingresa con tu correo'}
                </div>
            </div>
        </>
    );
}
