import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Code2,
    Headphones,
    Laptop,
    PackageCheck,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
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
        <div className="relative min-h-screen overflow-hidden bg-[#09110c] text-white selection:bg-lime-400 selection:text-black">
            {/* Ambient Lighting & Grid */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(132,255,75,.15),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(52,211,153,.12),transparent_45%),linear-gradient(180deg,#060c08_0%,#0e1814_100%)]" />
            <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(132,255,75,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(132,255,75,.05)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] [background-size:48px_48px] opacity-30" />

            {/* Back to Store Button */}
            <div className="absolute top-6 left-6 z-30">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl transition hover:border-lime-400/50 hover:bg-black/60 hover:text-lime-300"
                >
                    <ArrowLeft className="size-4" /> Volver a la tienda
                </Link>
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="grid w-full gap-8 lg:grid-cols-12 lg:items-center">
                    {/* Left Panel: 3D Showcase (Desktop) */}
                    <div className="hidden flex-col justify-center gap-8 lg:col-span-6 lg:flex xl:col-span-7">
                        <div className="flex items-center gap-3">
                            <div className="flex size-14 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                                <img
                                    src="/images/brand/jbtechline-logo.png"
                                    alt="JBTECHLINE"
                                    className="size-10 object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl leading-none font-black tracking-tight text-white">
                                    JB<span className="text-lime-400">TECHLINE</span>
                                </h1>
                                <p className="mt-1 text-[10px] font-bold tracking-[.25em] text-lime-400/80 uppercase">
                                    Tu aliado tecnológico 3D
                                </p>
                            </div>
                        </div>

                        <div className="max-w-lg space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3.5 py-1.5 text-xs font-bold text-lime-300">
                                <Sparkles className="size-3.5" /> Ecosistema Digital Inteligente
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Acceso centralizado a tus equipos y soluciones
                            </h2>
                            <p className="text-sm leading-relaxed text-white/60">
                                Inicia sesión para administrar tus pedidos en tiempo real, descargar software autorizado y solicitar asesoría técnica 360°.
                            </p>
                        </div>

                        {/* Feature Cards 3D Grid */}
                        <div className="grid max-w-lg gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/4 p-4 backdrop-blur-xl transition duration-300 hover:border-lime-400/40 hover:bg-white/8">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                                    <PackageCheck className="size-5" />
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-white">
                                    Seguimiento de Pedidos
                                </h3>
                                <p className="mt-1 text-xs text-white/50">
                                    Consulta el estado de compras y comprobantes al instante.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/4 p-4 backdrop-blur-xl transition duration-300 hover:border-lime-400/40 hover:bg-white/8">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                                    <Code2 className="size-5" />
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-white">
                                    Software & Programas
                                </h3>
                                <p className="mt-1 text-xs text-white/50">
                                    Descarga directa de licencias e instaladores corporativos.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/4 p-4 backdrop-blur-xl transition duration-300 hover:border-lime-400/40 hover:bg-white/8">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                                    <Headphones className="size-5" />
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-white">
                                    Soporte Técnico 360°
                                </h3>
                                <p className="mt-1 text-xs text-white/50">
                                    Asistencia especializada directa para todos tus equipos.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/4 p-4 backdrop-blur-xl transition duration-300 hover:border-lime-400/40 hover:bg-white/8">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-white">
                                    Seguridad Cifrada
                                </h3>
                                <p className="mt-1 text-xs text-white/50">
                                    Protección de datos con soporte para Passkeys y 2FA.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-medium text-white/40">
                            <span className="flex items-center gap-1.5 text-lime-400">
                                <CheckCircle2 className="size-4" /> Autenticación Segura
                            </span>
                            <span>•</span>
                            <span>JBTECHLINE © {new Date().getFullYear()}</span>
                        </div>
                    </div>

                    {/* Right Panel: Form Card Container */}
                    <div className="flex justify-center lg:col-span-6 lg:justify-end xl:col-span-5">
                        <div className="w-full max-w-md">
                            {/* Glassmorphism Card */}
                            <div className="relative overflow-hidden rounded-3xl border border-white/14 bg-[#071008]/85 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-8">
                                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-lime-400/10 blur-2xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

                                {/* Mobile Logo Header */}
                                <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                                    <Link href={home()} className="mb-3 flex items-center gap-2">
                                        <img
                                            src="/images/brand/jbtechline-logo.png"
                                            alt="JBTECHLINE"
                                            className="h-10 w-12 object-contain"
                                        />
                                        <span className="text-xl font-black tracking-tight text-white">
                                            JB<span className="text-lime-400">TECHLINE</span>
                                        </span>
                                    </Link>
                                </div>

                                {/* Title Header */}
                                {(title || description) && (
                                    <div className="mb-6 space-y-1.5 text-left">
                                        {title && (
                                            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                                                {title}
                                            </h2>
                                        )}
                                        {description && (
                                            <p className="text-xs leading-relaxed text-white/55">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Main Form Body */}
                                <div>{children}</div>

                                {/* Trust Footer */}
                                <div className="mt-8 border-t border-white/10 pt-4 text-center">
                                    <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/40">
                                        <ShieldCheck className="size-3.5 text-lime-400" />
                                        Plataforma segura cifrada de extremo a extremo
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
