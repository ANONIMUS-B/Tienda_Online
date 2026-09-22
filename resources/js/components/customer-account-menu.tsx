import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    KeyRound,
    LogOut,
    Package,
    UserRound,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/routes';
import { edit as profile } from '@/routes/profile';
import { edit as security } from '@/routes/security';
import { index as orders } from '@/routes/orders';
import type { User } from '@/types';

export default function CustomerAccountMenu({
    user,
    onNavigate,
}: {
    user: User;
    onNavigate?: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex max-w-56 items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-800"
                    aria-label={`Cuenta de ${user.name}`}
                >
                    <UserRound className="size-4 shrink-0" />
                    <span className="truncate">{user.name}</span>
                    <ChevronDown className="size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="store-light z-[100] w-64 bg-white text-slate-800"
            >
                <DropdownMenuLabel>
                    <p className="truncate">{user.name}</p>
                    <p className="truncate text-xs font-normal text-slate-500">
                        {user.email}
                    </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={profile()} onClick={onNavigate}>
                        <UserRound />
                        Mis datos
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={security()} onClick={onNavigate}>
                        <KeyRound />
                        Cambiar contraseña
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={orders()} onClick={onNavigate}>
                        <Package />
                        Mis pedidos
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="w-full"
                        onClick={onNavigate}
                    >
                        <LogOut />
                        Cerrar sesión
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
