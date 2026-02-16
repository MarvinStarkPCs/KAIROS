export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden bg-card p-1">
                <img
                    src="/logo_academia_black.png"
                    alt="Academia Linaje"
                    className="size-full object-contain dark:hidden"
                />
                <img
                    src="/logo_academia_white.png"
                    alt="Academia Linaje"
                    className="size-full object-contain hidden dark:block"
                />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Academia Linaje</span>
                <span className="truncate text-xs text-muted-foreground">Sistema Académico</span>
            </div>
        </>
    );
}
