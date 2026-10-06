<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="notranslate" translate="no">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Página no encontrada (404) | {{ config('app.name', 'JBTECHLINE') }}</title>
    <link rel="icon" href="/images/brand/jbtechline-icon-v3.png" type="image/png">
    @fonts
    @vite(['resources/css/app.css'])
</head>
<body class="store-light flex h-screen max-h-screen flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-[#f0fbfd] to-white font-sans text-[#2a6572] antialiased pt-20">
    <header class="border-b border-[#00cfe8]/20 bg-white/95 backdrop-blur-md fixed inset-x-0 top-0 z-50 h-20 flex items-center">
        <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-5">
            <a href="/" class="flex items-center">
                <img src="/images/brand/jbtechline-logo-v2.png" alt="JBTECHLINE" class="h-8 w-auto object-contain">
            </a>
            <div class="flex items-center gap-3">
                <a href="/" class="rounded-xl bg-[#00cfe8] px-4 py-2 text-xs font-bold text-[#2a6572] shadow-sm transition hover:bg-[#00b9d1]">
                    Ir al Inicio
                </a>
            </div>
        </div>
    </header>

    <main class="flex flex-1 w-full items-center justify-center overflow-hidden p-2 sm:p-4">
        <a href="/" class="flex h-full w-full items-center justify-center cursor-pointer" title="Volver al Inicio">
            <img
                src="/videos/404.webp"
                alt="404 - Ups, página no encontrada"
                class="h-full w-full max-h-[calc(100vh-5rem-3.5rem)] object-contain"
                width={1280}
                height={720}
            >
        </a>
    </main>

    <footer class="border-t border-[#00cfe8]/20 bg-white/90 py-3 backdrop-blur-xs">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-5 text-xs text-[#60818a]">
            <div class="flex items-center gap-3">
                <img src="/images/brand/jbtechline-logo-v2.png" alt="JBTECHLINE" class="h-6 w-auto object-contain">
                <span class="text-[#60818a]/40">|</span>
                <span>Soluciones Tecnológicas Integrales</span>
            </div>
            <p>&copy; {{ date('Y') }} JBTECHLINE. Todos los derechos reservados.</p>
        </div>
    </footer>
</body>
</html>
