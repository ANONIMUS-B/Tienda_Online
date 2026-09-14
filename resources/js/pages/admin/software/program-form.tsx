import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { SoftwareProgram } from '@/types/software';
const input = 'w-full rounded-md border bg-transparent px-3 py-2';
export default function ProgramForm({
    action,
    method,
    program,
}: {
    action: string;
    method: 'post' | 'put';
    program?: SoftwareProgram;
}) {
    return (
        <Form
            action={action}
            method={method}
            className="grid gap-4 md:grid-cols-2"
        >
            {({ errors, processing }) => (
                <>
                    <input
                        name="name"
                        defaultValue={program?.name}
                        placeholder="Nombre"
                        className={input}
                    />
                    <input
                        name="slug"
                        defaultValue={program?.slug}
                        placeholder="slug-del-programa"
                        className={input}
                    />
                    <input
                        name="category"
                        defaultValue={program?.category}
                        placeholder="Categoría"
                        className={input}
                    />
                    <input
                        name="platform"
                        defaultValue={program?.platform ?? ''}
                        placeholder="Windows, Android, Web…"
                        className={input}
                    />
                    <input
                        name="version"
                        defaultValue={program?.version ?? ''}
                        placeholder="Versión"
                        className={input}
                    />
                    <select
                        name="license_type"
                        defaultValue={program?.license_type ?? 'free'}
                        className={input}
                    >
                        <option value="free">Gratis</option>
                        <option value="demo">Demo</option>
                        <option value="paid">De pago</option>
                    </select>
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={program?.price ?? ''}
                        placeholder="Precio"
                        className={input}
                    />
                    <input
                        name="short_description"
                        defaultValue={program?.short_description}
                        placeholder="Descripción corta"
                        className={input}
                    />
                    <textarea
                        name="description"
                        defaultValue={program?.description ?? ''}
                        placeholder="Descripción completa"
                        className={`${input} min-h-28 md:col-span-2`}
                    />
                    <textarea
                        name="requirements"
                        defaultValue={program?.requirements ?? ''}
                        placeholder="Requisitos del sistema"
                        className={`${input} min-h-24 md:col-span-2`}
                    />
                    <textarea
                        name="installation_instructions"
                        defaultValue={program?.installation_instructions ?? ''}
                        placeholder="Pasos de instalación, uno por línea"
                        className={`${input} min-h-24 md:col-span-2`}
                    />
                    <input
                        name="tutorial_url"
                        type="url"
                        defaultValue={program?.tutorial_url ?? ''}
                        placeholder="Enlace del video tutorial"
                        className={`${input} md:col-span-2`}
                    />
                    <label>
                        Imagen
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className={`${input} mt-1`}
                        />
                    </label>
                    <label>
                        Archivo del programa
                        <input
                            name="program_file"
                            type="file"
                            className={`${input} mt-1`}
                        />
                    </label>
                    {[
                        [
                            'download_enabled',
                            'Permitir descarga gratuita',
                            program?.download_enabled,
                        ],
                        [
                            'is_own',
                            'Desarrollado por nosotros',
                            program?.is_own,
                        ],
                        ['is_featured', 'Destacado', program?.is_featured],
                        ['is_active', 'Publicado', program?.is_active ?? true],
                    ].map(([name, label, checked]) => (
                        <label key={String(name)} className="flex gap-2">
                            <input
                                type="hidden"
                                name={String(name)}
                                value="0"
                            />
                            <input
                                type="checkbox"
                                name={String(name)}
                                value="1"
                                defaultChecked={Boolean(checked)}
                            />
                            {String(label)}
                        </label>
                    ))}
                    {Object.values(errors).length > 0 && (
                        <p className="text-destructive md:col-span-2">
                            {Object.values(errors)[0]}
                        </p>
                    )}
                    <Button disabled={processing} className="md:col-span-2">
                        Guardar programa
                    </Button>
                </>
            )}
        </Form>
    );
}
