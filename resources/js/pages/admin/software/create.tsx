import { Head } from '@inertiajs/react';
import ProgramForm from './program-form';
import { index, store } from '@/routes/admin/software';
import AdminFormModal from '@/components/admin/admin-form-modal';
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
            <AdminFormModal title="Nuevo programa" backHref={`${index(currentTeam.slug).url}?catalog=programs`}>
                <h1 className="mb-6 text-2xl font-semibold">{catalogType === 'software' ? 'Nuevo software' : 'Nuevo programa'}</h1>
                <ProgramForm
                    action={store(currentTeam.slug).url}
                    method="post"
                    catalogType={catalogType}
                />
            </AdminFormModal>
        </>
    );
}
