import type { ReactNode } from 'react';
import CartDrawer from '@/components/cart-drawer';
import PublicHeader from '@/components/public-header';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <PublicHeader />
            {children}
            <CartDrawer />
        </>
    );
}
