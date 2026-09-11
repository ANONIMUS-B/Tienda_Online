import { Head } from '@inertiajs/react';
import ProgramForm from './program-form';
import { update } from '@/routes/admin/software';
import type { SoftwareProgram } from '@/types/software';
export default function Edit({
    program,
    currentTeam,
}: {
    program: SoftwareProgram;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title={program.name} />
            <div className="max-w-4xl p-4 md:p-8">
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
                />
            </div>
        </>
    );
}
