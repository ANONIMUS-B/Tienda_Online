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
        const event = typeof CustomEvent !== 'undefined' ? new CustomEvent('open-cart-drawer') : new Event('open-cart-drawer');
        window.dispatchEvent(event);
    }
}

export function closeCartDrawer() {
    if (typeof window !== 'undefined') {
        const event = typeof CustomEvent !== 'undefined' ? new CustomEvent('close-cart-drawer') : new Event('close-cart-drawer');
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
    const cart = (props.cart as CartData) || { items: [], count: 0, subtotal: 0 };
    const flash = (props.flash as any) || {};

    // Auto-open drawer when a product is added to cart
    useEffect(() => {
        if (flash?.toast?.message && flash.toast.type === 'success') {
            const msg = flash.toast.message.toLowerCase();
            if (msg.includes('carrito') || msg.includes('agregado') || msg.includes('añadido')) {
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
            }
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
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md border-l border-lime-400/25 bg-[#08110c]/95 backdrop-blur-2xl shadow-2xl shadow-lime-950/40 flex flex-col text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400">
                                <ShoppingBag className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white">Tu Carrito</h2>
                                <p className="text-xs text-white/50">{cart.count} {cart.count === 1 ? 'producto' : 'productos'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl border border-white/10 p-2 text-white/70 hover:border-lime-400/50 hover:bg-white/5 hover:text-white transition"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {cart.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                                    <ShoppingBag className="size-10" />
                                </div>
                                <h3 className="text-base font-semibold text-white">Tu carrito está vacío</h3>
                                <p className="text-xs text-white/50 mt-1 max-w-[240px]">
                                    Añade componentes o software tecnológico para comenzar tu compra.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="mt-6 rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-bold text-black hover:bg-lime-300 transition"
                                >
                                    Explorar Productos
                                </button>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group relative flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-lime-400/30 ${
                                        updatingId === item.id ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 flex items-center justify-center">
                                        <img
                                            src={item.image || '/images/brand/jbtechline-logo.png'}
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = '/images/brand/jbtechline-logo.png';
                                            }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col justify-between min-w-0">
                                        <div>
                                            {(item.brand || item.category) && (
                                                <span className="text-[10px] font-semibold tracking-wider text-lime-400/90 uppercase block truncate">
                                                    {item.brand || item.category}
                                                </span>
                                            )}
                                            <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                                                {item.name}
                                            </h4>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 px-1.5 py-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                    className="rounded p-1 text-white/70 hover:text-lime-400 hover:bg-white/10 transition"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="w-6 text-center text-xs font-bold text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                    className="rounded p-1 text-white/70 hover:text-lime-400 hover:bg-white/10 transition"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-xs font-black text-lime-400">
                                                    S/ {item.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-[10px] text-white/40">
                                                        S/ {item.price.toLocaleString('es-PE', { minimumFractionDigits: 2 })} c/u
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item)}
                                        className="absolute top-2 right-2 text-white/30 hover:text-red-400 transition"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.items.length > 0 && (
                        <div className="border-t border-white/10 bg-[#060e0a]/90 p-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/60 font-medium">Subtotal Estimado</span>
                                <span className="text-lg font-black text-lime-400">
                                    S/ {cart.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {/* Button 1: Finalizar Compra */}
                                <Link
                                    href={checkoutCreate().url}
                                    onClick={() => setIsOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 text-xs font-bold text-black shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition"
                                >
                                    Finalizar Compra <ArrowRight className="size-4" />
                                </Link>

                                {/* Button 2: Pedir por WhatsApp */}
                                <a
                                    href={cartWhatsapp().url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                                >
                                    Pedir por WhatsApp
                                </a>

                                {/* Button 3: Ver detalle del carrito */}
                                <Link
                                    href={cartIndex().url}
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center text-xs font-semibold text-white/50 hover:text-white transition py-1"
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
