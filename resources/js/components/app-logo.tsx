export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-black/40 ring-1 ring-emerald-500/20">
                <img src="/images/brand/jbtechline-logo.png" alt="" className="size-9 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    JBTECHLINE
                </span>
                <span className="truncate text-[10px] text-muted-foreground">Panel administrativo</span>
            </div>
        </>
    );
}
