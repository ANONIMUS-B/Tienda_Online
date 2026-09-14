import { Form, Head, Link } from '@inertiajs/react';
import { ExternalLink, Save } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit, update } from '@/routes/admin/homepage';
import { home } from '@/routes';
import type { HeroContent } from '@/types/homepage';

export default function EditHomepage({
    hero,
    currentTeam,
}: {
    hero: HeroContent;
    currentTeam: { slug: string };
}) {
    return (
        <>
            <Head title="Administrar portada" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Portada 3D</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Edita el contenido principal sin modificar código.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={home()} target="_blank">
                            Ver sitio <ExternalLink />
                        </Link>
                    </Button>
                </div>

                <Form
                    action={update(currentTeam.slug)}
                    className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
                    options={{ preserveScroll: true }}
                >
                    {({ errors, processing, wasSuccessful }) => (
                        <>
                            <div className="bg-card grid gap-6 rounded-xl border p-5 sm:p-7">
                                <Field
                                    label="Texto superior"
                                    name="hero_overline"
                                    value={hero.hero_overline}
                                    error={errors.hero_overline}
                                />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        label="Título principal"
                                        name="hero_title"
                                        value={hero.hero_title}
                                        error={errors.hero_title}
                                    />
                                    <Field
                                        label="Título destacado"
                                        name="hero_accent"
                                        value={hero.hero_accent}
                                        error={errors.hero_accent}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hero_description">
                                        Descripción
                                    </Label>
                                    <textarea
                                        id="hero_description"
                                        name="hero_description"
                                        defaultValue={hero.hero_description}
                                        rows={4}
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                                    />
                                    <InputError
                                        message={errors.hero_description}
                                    />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        label="Botón principal"
                                        name="hero_primary_label"
                                        value={hero.hero_primary_label}
                                        error={errors.hero_primary_label}
                                    />
                                    <Field
                                        label="Enlace principal"
                                        name="hero_primary_url"
                                        value={hero.hero_primary_url}
                                        error={errors.hero_primary_url}
                                    />
                                    <Field
                                        label="Botón secundario"
                                        name="hero_secondary_label"
                                        value={hero.hero_secondary_label}
                                        error={errors.hero_secondary_label}
                                    />
                                    <Field
                                        label="Enlace secundario"
                                        name="hero_secondary_url"
                                        value={hero.hero_secondary_url}
                                        error={errors.hero_secondary_url}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hero_image">
                                        Imagen principal 3D
                                    </Label>
                                    <Input
                                        id="hero_image"
                                        name="hero_image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                    />
                                    <InputError message={errors.hero_image} />
                                    <p className="text-muted-foreground text-xs">
                                        Déjalo vacío para conservar la imagen
                                        actual.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save />{' '}
                                        {processing
                                            ? 'Guardando…'
                                            : 'Guardar cambios'}
                                    </Button>
                                    {wasSuccessful && (
                                        <p className="text-sm text-emerald-600">
                                            Portada actualizada.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <aside className="bg-brand-background overflow-hidden rounded-xl border text-white">
                                <div className="bg-[radial-gradient(circle_at_center,rgba(113,255,46,.18),transparent_60%)] p-6">
                                    <p className="text-xs tracking-[.2em] text-lime-400 uppercase">
                                        Vista previa
                                    </p>
                                    <p className="mt-5 text-4xl leading-none font-light tracking-tight uppercase">
                                        {hero.hero_title}
                                    </p>
                                    <img
                                        src={hero.hero_image_path}
                                        alt="Vista previa del recurso 3D"
                                        className="my-5 aspect-square w-full object-contain"
                                    />
                                    <p className="text-right text-3xl leading-none font-light tracking-tight uppercase">
                                        {hero.hero_accent}
                                    </p>
                                </div>
                            </aside>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

EditHomepage.layout = (props: { currentTeam: { slug: string } }) => ({
    breadcrumbs: [
        { title: 'Administrar portada', href: edit(props.currentTeam.slug) },
    ],
});

function Field({
    label,
    name,
    value,
    error,
}: {
    label: string;
    name: keyof HeroContent;
    value: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} defaultValue={value} />
            <InputError message={error} />
        </div>
    );
}
