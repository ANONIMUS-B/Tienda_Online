import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PublicLayout from '@/layouts/public-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'JBTECHLINE';

void createInertiaApp({
    defaults: {
        prefetch: {
            cacheFor: '2m',
            hoverDelay: 50,
        },
    },
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'public-section':
            case name.startsWith('products/'):
            case name.startsWith('cart/'):
            case name.startsWith('checkout/'):
            case name.startsWith('orders/'):
            case name.startsWith('software/'):
            case name.startsWith('search/'):
            case name.startsWith('service-requests/'):
                return PublicLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
            case name.startsWith('teams/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <FlashToasts />
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: false,
});

function FlashToasts() {
    useFlashToast();

    return null;
}

// This will set light / dark mode on load...
initializeTheme();
