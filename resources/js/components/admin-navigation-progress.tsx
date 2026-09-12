import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminNavigationProgress() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStartListener = router.on('start', () => setLoading(true));
        const removeFinishListener = router.on('finish', () => setLoading(false));

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    if (!loading) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center py-3">
            <div className="flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-xl">
                <LoaderCircle className="size-4 animate-spin text-emerald-500" />
                Actualizando contenido…
            </div>
        </div>
    );
}
