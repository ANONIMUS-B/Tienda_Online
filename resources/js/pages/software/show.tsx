import { Head, Link } from '@inertiajs/react';
import { Download, LockKeyhole } from 'lucide-react';
import { contact, login, register, software } from '@/routes';
import {
    download as programDownload,
    index as programsIndex,
} from '@/routes/programs';
import type { SoftwareProgram } from '@/types/software';
export default function SoftwareShow({
    program,
    catalogType,
}: {
    program: SoftwareProgram;
    catalogType: 'software' | 'programs';
}) {
    const isPrograms = catalogType === 'programs';
    return (
        <div className="bg-brand-background min-h-screen text-white">
            <Head title={`${program.name} | Software JBTECHLINE`} />
            <main className="mx-auto max-w-6xl px-5 pt-24 pb-14 sm:pt-28">
                <Link
                    href={isPrograms ? programsIndex() : software()}
                    className="text-sm text-white/45"
                >
                    ← Volver al software
                </Link>
                <div className="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-2 lg:gap-10">
                    <div className="aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                        {program.image_url && (
                            <img
                                src={program.image_url}
                                alt={program.name}
                                className="size-full object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-lime-400">
                            {program.category} · {program.platform} · v
                            {program.version}
                        </p>
                        <h1 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl">
                            {program.name}
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-white/55">
                            {program.short_description}
                        </p>
                        <p className="mt-7 whitespace-pre-line text-white/50">
                            {program.description}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href={
                                    isPrograms
                                        ? programDownload(program.slug).url
                                        : contact().url
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-4 font-bold text-black"
                            >
                                <Download className="size-5" />
                                {isPrograms
                                    ? 'Descargar'
                                    : 'Solicitar demostración'}
                            </a>
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 font-bold"
                            >
                                <LockKeyhole className="size-5" />
                                Crear cuenta
                            </Link>
                            <Link
                                href={login()}
                                className="px-5 py-4 text-white/60"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                        <p className="mt-4 text-xs text-white/35">
                            La descarga requiere una sesión de cliente
                            registrada.
                        </p>
                        {program.requirements && (
                            <div className="mt-8 border-t border-white/10 pt-6">
                                <h2 className="font-bold">Requisitos</h2>
                                <p className="mt-3 text-sm whitespace-pre-line text-white/45">
                                    {program.requirements}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
