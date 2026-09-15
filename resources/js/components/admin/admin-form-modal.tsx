import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export default function AdminFormModal({ title, description, backHref, children }: { title: string; description?: string; backHref: string; children: ReactNode }) {
    const close = () => window.location.assign(backHref);
    useEffect(() => {
        const closeWithEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
        window.addEventListener('keydown', closeWithEscape);
        return () => window.removeEventListener('keydown', closeWithEscape);
    }, [backHref]);
    return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-sm md:p-8">
        <button type="button" onClick={close} aria-label="Cerrar" className="absolute inset-0" />
        <section role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" className="relative z-10 mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur md:px-7">
                <div><h1 id="admin-modal-title" className="text-xl font-semibold md:text-2xl">{title}</h1>{description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}</div>
                <button type="button" onClick={close} aria-label="Cerrar" className="grid size-10 shrink-0 place-items-center rounded-full border hover:bg-muted"><X className="size-5" /></button>
            </header>
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 md:p-7">{children}</div>
        </section>
    </div>;
}
