import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage().props;
    if (auth.user?.role === 'user') {
        return (
            <PublicLayout>
                <main className="mx-auto max-w-5xl px-4 pt-28 pb-16">
                    {children}
                </main>
            </PublicLayout>
        );
    }
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
