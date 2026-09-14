import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { search } from '@/routes';

export default function SearchPopover({
    showLabel = false,
}: {
    showLabel?: boolean;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget)
            .get('q')
            ?.toString()
            .trim();
        const type =
            new FormData(event.currentTarget).get('type')?.toString() ?? 'all';
        if (!query) return;
        setOpen(false);
        router.get(search().url, { q: query, type });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="Abrir buscador"
                aria-expanded={open}
                className={
                    showLabel
                        ? 'flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm'
                        : 'rounded-full p-2.5 text-white/70 hover:bg-white/8 hover:text-lime-400'
                }
            >
                <Search className="size-5" /> {showLabel && 'Buscar'}
            </button>
            {open && (
                <div className="border-brand-primary/35 bg-brand-background fixed top-24 right-4 left-4 z-[70] rounded-2xl border p-4 shadow-2xl shadow-black/40 sm:absolute sm:top-[calc(100%+12px)] sm:right-0 sm:left-auto sm:w-[560px]">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-white">
                                Buscar en JBTECHLINE
                            </p>
                            <p className="text-xs text-white/45">
                                Productos, software, programas y servicios
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar buscador"
                            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <form
                        onSubmit={submit}
                        className="grid gap-2 sm:grid-cols-[1fr_150px_auto]"
                    >
                        <input
                            autoFocus
                            name="q"
                            type="search"
                            placeholder="¿Qué estás buscando?"
                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-lime-400/60"
                        />
                        <select
                            name="type"
                            aria-label="Filtrar búsqueda"
                            className="border-brand-support/20 bg-brand-background rounded-xl border px-3 py-3 text-sm text-white"
                        >
                            <option value="all">Todo</option>
                            <option value="products">Productos</option>
                            <option value="software">Software propio</option>
                            <option value="programs">Programas</option>
                            <option value="services">Servicios</option>
                        </select>
                        <button className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-black">
                            Buscar
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
