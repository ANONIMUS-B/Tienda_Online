import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpen,
    FolderGit2,
    FolderTree,
    LayoutGrid,
    PanelsTopLeft,
    Package,
    ShoppingBag,
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
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
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
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
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

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
