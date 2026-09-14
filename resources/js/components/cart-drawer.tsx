import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { create as checkoutCreate } from '@/routes/checkout';
import {
    destroy as cartDestroy,
    index as cartIndex,
    update as cartUpdate,
    whatsapp as cartWhatsapp,
} from '@/routes/cart';

export function openCartDrawer() {
    if (typeof window !== 'undefined') {
        const event =
            typeof CustomEvent !== 'undefined'
                ? new CustomEvent('open-cart-drawer')
                : new Event('open-cart-drawer');
        window.dispatchEvent(event);
    }
}

export function closeCartDrawer() {
    if (typeof window !== 'undefined') {
        const event =
            typeof CustomEvent !== 'undefined'
                ? new CustomEvent('close-cart-drawer')
                : new Event('close-cart-drawer');
        window.dispatchEvent(event);
    }
}

interface CartItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    total: number;
    image: string;
    brand?: string;
    category?: string;
}

interface CartData {
    items: CartItem[];
    count: number;
    subtotal: number;
}

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const { props } = usePage();
    const cart = (props.cart as CartData) || {
        items: [],
        count: 0,
        subtotal: 0,
    };
    const flash = (props.flash as any) || {};

    // Auto-open drawer when a product is added to cart
    useEffect(() => {
        if (flash?.toast?.message && flash.toast.type === 'success') {
            const msg = flash.toast.message.toLowerCase();
            if (
                msg.includes('carrito') ||
                msg.includes('agregado') ||
                msg.includes('añadido')
            ) {
                setIsOpen(true);
            }
        }
    }, [flash]);

    // Custom event listeners
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        const handleClose = () => setIsOpen(false);

        window.addEventListener('open-cart-drawer', handleOpen);
        window.addEventListener('close-cart-drawer', handleClose);

        return () => {
            window.removeEventListener('open-cart-drawer', handleOpen);
            window.removeEventListener('close-cart-drawer', handleClose);
        };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleUpdateQuantity = (item: CartItem, newQty: number) => {
        if (newQty < 1) {
            handleRemoveItem(item);
            return;
        }
        setUpdatingId(item.id);
        router.patch(
            cartUpdate(item.slug).url,
            { quantity: newQty },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingId(null),
            },
        );
    };

    const handleRemoveItem = (item: CartItem) => {
        setUpdatingId(item.id);
        router.delete(cartDestroy(item.slug).url, {
            preserveScroll: true,
            onFinish: () => setUpdatingId(null),
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="store-light fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="floating-cart-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Floating cart window */}
            <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl sm:max-h-[min(760px,calc(100dvh-3rem))]">
                <div className="border-brand-primary/35 bg-brand-background/95 flex w-full flex-col overflow-hidden rounded-3xl border text-white shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
                                <ShoppingBag className="size-5" />
                            </div>
                            <div>
                                <h2
                                    id="floating-cart-title"
                                    className="text-lg font-bold tracking-tight text-white"
                                >
                                    Tu Carrito
                                </h2>
                                <p className="text-xs text-white/50">
                                    {cart.count}{' '}
                                    {cart.count === 1
                                        ? 'producto'
                                        : 'productos'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:border-lime-400/50 hover:bg-white/5 hover:text-white"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
                        {cart.items.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/30">
                                    <ShoppingBag className="size-10" />
                                </div>
                                <h3 className="text-base font-semibold text-white">
                                    Tu carrito está vacío
                                </h3>
                                <p className="mt-1 max-w-[240px] text-xs text-white/50">
                                    Añade componentes o software tecnológico
                                    para comenzar tu compra.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="mt-6 rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-bold text-black transition hover:bg-lime-300"
                                >
                                    Explorar Productos
                                </button>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group relative flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-lime-400/30 sm:gap-4 sm:p-3.5 ${
                                        updatingId === item.id
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 sm:size-20">
                                        <img
                                            src={
                                                item.image ||
                                                '/images/brand/jbtechline-logo.png'
                                            }
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                (
                                                    e.currentTarget as HTMLImageElement
                                                ).src =
                                                    '/images/brand/jbtechline-logo.png';
                                            }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                                        <div>
                                            {(item.brand || item.category) && (
                                                <span className="block truncate text-[10px] font-semibold tracking-wider text-lime-400/90 uppercase">
                                                    {item.brand ||
                                                        item.category}
                                                </span>
                                            )}
                                            <h4 className="line-clamp-2 text-xs leading-snug font-bold text-white">
                                                {item.name}
                                            </h4>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 px-1.5 py-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="rounded p-1 text-white/70 transition hover:bg-white/10 hover:text-lime-400"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="w-6 text-center text-xs font-bold text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="rounded p-1 text-white/70 transition hover:bg-white/10 hover:text-lime-400"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-xs font-black text-lime-400">
                                                    S/{' '}
                                                    {item.total.toLocaleString(
                                                        'es-PE',
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    )}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-[10px] text-white/40">
                                                        S/{' '}
                                                        {item.price.toLocaleString(
                                                            'es-PE',
                                                            {
                                                                minimumFractionDigits: 2,
                                                            },
                                                        )}{' '}
                                                        c/u
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item)}
                                        className="absolute top-2 right-2 text-white/30 transition hover:text-red-400"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.items.length > 0 && (
                        <div className="border-brand-support/15 space-y-3 border-t bg-black/20 p-4 sm:space-y-4 sm:p-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-white/60">
                                    Subtotal Estimado
                                </span>
                                <span className="text-lg font-black text-lime-400">
                                    S/{' '}
                                    {cart.subtotal.toLocaleString('es-PE', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {/* Button 1: Finalizar Compra */}
                                <Link
                                    href={checkoutCreate().url}
                                    onClick={() => setIsOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 text-xs font-bold text-black shadow-lg shadow-lime-400/20 transition hover:bg-lime-300"
                                >
                                    Finalizar Compra{' '}
                                    <ArrowRight className="size-4" />
                                </Link>

                                {/* Button 2: Pedir por WhatsApp */}
                                <a
                                    href={cartWhatsapp().url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                                >
                                    Pedir por WhatsApp
                                </a>

                                {/* Button 3: Ver detalle del carrito */}
                                <Link
                                    href={cartIndex().url}
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full py-1 text-center text-xs font-semibold text-white/50 transition hover:text-white"
                                >
                                    Ver detalle del carrito
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
