import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Globe2,
    FolderTree,
    LayoutGrid,
    PanelsTopLeft,
    Package,
    ShoppingBag,
    Settings,
    Code2,
    MessagesSquare,
    KeyRound,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as brandIndex } from '@/routes/admin/brands';
import { index as productIndex } from '@/routes/admin/products';
import { index as orderIndex } from '@/routes/admin/orders';
import { edit as editHomepage } from '@/routes/admin/homepage';
import { index as categoryIndex } from '@/routes/admin/categories';
import { edit as companySettings } from '@/routes/admin/company-settings';
import { index as softwareIndex } from '@/routes/admin/software';
import { index as customerIndex } from '@/routes/admin/customers';
import { index as userIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Panel principal',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(page.props.currentTeam?.role !== 'member'
            ? [
                  {
                      title: 'Administrar portada',
                      href: page.props.currentTeam
                          ? editHomepage(page.props.currentTeam.slug)
                          : '/',
                      icon: PanelsTopLeft,
                  },
                  {
                      title: 'Categorías',
                      href: page.props.currentTeam
                          ? categoryIndex(page.props.currentTeam.slug)
                          : '/',
                      icon: FolderTree,
                  },
                  {
                      title: 'Marcas',
                      href: page.props.currentTeam
                          ? brandIndex(page.props.currentTeam.slug)
                          : '/',
                      icon: BadgeCheck,
                  },
                  {
                      title: 'Productos',
                      href: page.props.currentTeam
                          ? productIndex(page.props.currentTeam.slug)
                          : '/',
                      icon: Package,
                  },
                  {
                      title: 'Pedidos',
                      href: page.props.currentTeam
                          ? orderIndex(page.props.currentTeam.slug)
                          : '/',
                      icon: ShoppingBag,
                  },
                  {
                      title: 'Solicitudes de servicio',
                      href: page.props.currentTeam
                          ? `/${page.props.currentTeam.slug}/administracion/solicitudes-servicio`
                          : '/',
                      icon: MessagesSquare,
                  },
                  {
                      title: 'Empresa y pagos',
                      href: page.props.currentTeam
                          ? companySettings(page.props.currentTeam.slug)
                          : '/',
                      icon: Settings,
                  },
                  {
                      title: 'Software',
                      href: page.props.currentTeam
                          ? `${softwareIndex(page.props.currentTeam.slug).url}?catalog=software`
                          : '/',
                      icon: Code2,
                  },
                  {
                      title: 'Programas',
                      href: page.props.currentTeam
                          ? `${softwareIndex(page.props.currentTeam.slug).url}?catalog=programs`
                          : '/',
                      icon: Code2,
                  },
                  {
                      title: 'Membresías de software',
                      href: page.props.currentTeam
                          ? `/${page.props.currentTeam.slug}/administracion/membresias-software`
                          : '/',
                      icon: KeyRound,
                  },
                  {
                      title: 'Clientes',
                      href: page.props.currentTeam
                          ? customerIndex(page.props.currentTeam.slug)
                          : '/',
                      icon: Users,
                  },
                  {
                      title: 'Usuarios y roles',
                      href: page.props.currentTeam
                          ? userIndex(page.props.currentTeam.slug)
                          : '/',
                      icon: Users,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        { title: 'Ver tienda pública', href: '/', icon: Globe2 },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-emerald-500/10"
        >
            <SidebarHeader className="border-sidebar-border/60 border-b p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-sidebar-border/60 border-t p-3">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
