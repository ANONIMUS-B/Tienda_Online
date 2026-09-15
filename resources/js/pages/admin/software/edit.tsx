import { Head } from '@inertiajs/react';
import ProgramForm from './program-form';
import { index, update } from '@/routes/admin/software';
import AdminFormModal from '@/components/admin/admin-form-modal';
import type { SoftwareProgram } from '@/types/software';
export default function Edit({
    program,
    currentTeam,
    catalogType,
}: {
    program: SoftwareProgram;
    currentTeam: { slug: string };
    catalogType: 'software' | 'programs';
}) {
    return (
        <>
            <Head title={program.name} />
            <AdminFormModal title={`Editar ${program.name}`} backHref={`${index(currentTeam.slug).url}?catalog=${catalogType}`}>
                <h1 className="mb-6 text-2xl font-semibold">
                    Editar {program.name}
                </h1>
                <ProgramForm
                    action={
                        update({
                            current_team: currentTeam.slug,
                            software_program: program.slug,
                        }).url
                    }
                    method="put"
                    program={program}
                    catalogType={catalogType}
                />
            </AdminFormModal>
        </>
    );
}
