import { Head } from '@inertiajs/react';
import ProgramForm from './program-form';
import { store } from '@/routes/admin/software';
export default function Create({
    currentTeam,
}: {
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Nuevo programa" />
            <div className="max-w-4xl p-4 md:p-8">
                <h1 className="mb-6 text-2xl font-semibold">Nuevo programa</h1>
                <ProgramForm
                    action={store(currentTeam.slug).url}
                    method="post"
                />
            </div>
        </>
    );
}
