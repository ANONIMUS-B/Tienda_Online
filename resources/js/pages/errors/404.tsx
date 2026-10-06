import { Head, Link } from '@inertiajs/react';
import { home } from '@/routes';

export default function NotFoundPage() {
    return (
        <div className="flex h-screen max-h-screen flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-[#f0fbfd] to-white pt-20 text-[#2a6572]">
            <Head title="Página no encontrada (404) | JBTECHLINE" />

            {/* Ambient subtle glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-20 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
            >
                <div className="aspect-[1318/752] w-[75rem] flex-none bg-gradient-to-tr from-[#00cfe8]/20 to-[#00f7ff]/20 opacity-40" />
            </div>

            {/* Center: Video/Animation showcased cleanly */}
            <main className="flex flex-1 w-full items-center justify-center overflow-hidden p-2 sm:p-4">
                <Link
                    href={home().url}
                    className="flex h-full w-full items-center justify-center cursor-pointer"
                    title="Volver al Inicio"
                >
                    <img
                        src="/videos/404.webp"
                        alt="404 - Ups, página no encontrada"
                        className="h-full w-full max-h-[calc(100vh-5rem-3.5rem)] object-contain"
                        loading="eager"
                        width={1280}
                        height={720}
                    />
                </Link>
            </main>

            {/* Cabecera de abajo (Footer / Barra inferior) */}
            <footer className="border-t border-[#00cfe8]/20 bg-white/90 py-3 backdrop-blur-xs">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 text-xs text-[#60818a]">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/brand/jbtechline-logo-v2.png"
                            alt="JBTECHLINE"
                            className="h-6 w-auto object-contain"
                        />
                        <span className="text-[#60818a]/40">|</span>
                        <span>Soluciones Tecnológicas Integrales</span>
                    </div>
                    <p>
                        &copy; {new Date().getFullYear()} JBTECHLINE. Todos los
                        derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
