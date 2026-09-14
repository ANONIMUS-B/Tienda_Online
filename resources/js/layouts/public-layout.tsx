import type { ReactNode } from 'react';
import CartDrawer from '@/components/cart-drawer';
import PublicHeader from '@/components/public-header';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="store-light min-h-screen bg-white text-[#2A6572]">
            <PublicHeader />
            {children}
            <CartDrawer />
        </div>
    );
}
