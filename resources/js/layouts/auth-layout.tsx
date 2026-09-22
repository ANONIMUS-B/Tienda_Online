import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { home } from '@/routes';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <main className="store-light text-brand-text flex min-h-svh items-center justify-center bg-white px-4 py-10 sm:px-6">
            <div className="border-brand-support/20 w-full max-w-md rounded-2xl border bg-white p-6 sm:p-8">
                <Link
                    href={home()}
                    aria-label="JBTECHLINE - Inicio"
                    className="focus-visible:outline-brand-interactive mx-auto mb-6 block w-72 max-w-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                    <img
                        src="/images/brand/jbtechline-logo-v2.png"
                        alt="JBTECHLINE"
                        width={2172}
                        height={724}
                        className="h-auto w-full object-contain"
                    />
                </Link>
                {(title || description) && (
                    <div className="mb-6 space-y-2 text-center">
                        {title && (
                            <h1 className="text-brand-text text-xl font-semibold">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-brand-support text-sm">
                                {description}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </main>
    );
}
