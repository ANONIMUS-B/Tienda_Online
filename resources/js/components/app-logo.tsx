import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center rounded-md bg-white px-1 py-0.5">
            <AppLogoIcon className="hidden size-7 shrink-0 object-contain group-data-[collapsible=icon]:block" />
            <img
                src="/images/brand/jbtechline-logo-v2.png"
                alt="JBTECHLINE"
                className="h-12 w-40 object-contain group-data-[collapsible=icon]:hidden"
            />
        </div>
    );
}
