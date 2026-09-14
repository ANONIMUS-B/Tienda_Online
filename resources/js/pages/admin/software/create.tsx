import { Head } from '@inertiajs/react';
import ProgramForm from './program-form';
import { store } from '@/routes/admin/software';
export default function Create({
    currentTeam,
    catalogType,
}: {
    currentTeam: { slug: string };
    catalogType: 'software' | 'programs';
}) {
    return (
        <>
            <Head title={catalogType === 'software' ? 'Nuevo software' : 'Nuevo programa'} />
            <div className="max-w-4xl p-4 md:p-8">
                <h1 className="mb-6 text-2xl font-semibold">{catalogType === 'software' ? 'Nuevo software' : 'Nuevo programa'}</h1>
                <ProgramForm
                    action={store(currentTeam.slug).url}
                    method="post"
                    catalogType={catalogType}
                />
            </div>
        </>
    );
}
