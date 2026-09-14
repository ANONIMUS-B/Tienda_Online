import { Form, Link } from '@inertiajs/react';
import {
    Check,
    CreditCard,
    ExternalLink,
    Settings2,
    ShieldCheck,
    ShoppingCart,
    Truck,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { store as addToCart } from '@/routes/cart';
import { show } from '@/routes/products';
import type { Product } from '@/types/product';

type ProductDetailModalProps = {
    product: Product | null;
    onClose: () => void;
};

export default function ProductDetailModal({
    product,
    onClose,
}: ProductDetailModalProps) {
    if (!product) {
        return null;
    }

    const currentPrice = product.promotional_price ?? product.price;

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="store-light max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-3xl border-cyan-200 bg-white p-0 shadow-[0_24px_80px_rgba(8,145,178,.25)] sm:w-[calc(100%-2rem)] sm:max-w-5xl">
                <div className="grid lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.15fr)]">
                    <div className="bg-cyan-50 p-5 sm:p-7">
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
                            {product.images[0] ? (
                                <img
                                    src={product.images[0].path}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain p-4"
                                />
                            ) : (
                                <span className="text-sm text-slate-400">
                                    Sin imagen
                                </span>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {product.images.slice(1, 5).map((image) => (
                                    <img
                                        key={image.id}
                                        src={image.path}
                                        alt={image.alt_text ?? product.name}
                                        className="aspect-square rounded-xl bg-white object-contain p-1"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-5 sm:p-8">
                        <DialogHeader>
                            <p className="text-xs font-black tracking-[.14em] text-cyan-500 uppercase">
                                {[product.brand?.name, product.category?.name]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                            <DialogTitle className="pr-8 text-2xl leading-tight font-black text-slate-900 sm:text-3xl">
                                {product.name}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                SKU: {product.sku}
                            </DialogDescription>
                        </DialogHeader>

                        <p className="mt-4 leading-6 text-slate-600">
                            {product.short_description}
                        </p>
                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                {product.promotional_price && (
                                    <p className="text-sm text-slate-400 line-through">
                                        S/ {product.price}
                                    </p>
                                )}
                                <p className="text-3xl font-black text-cyan-600">
                                    S/ {currentPrice}
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${product.stock > 0 ? 'bg-cyan-50 text-cyan-700' : 'bg-red-50 text-red-600'}`}
                            >
                                {product.stock > 0 ? 'Disponible' : 'Agotado'}
                            </span>
                        </div>

                        {(product.specifications ||
                            product.benefits?.length) && (
                            <div className="mt-6 grid gap-6 border-t border-cyan-100 pt-5 sm:grid-cols-2">
                                {product.specifications && (
                                    <section>
                                        <h3 className="flex items-center gap-2 font-black text-slate-800">
                                            <Settings2 className="size-4 text-cyan-500" />
                                            Especificaciones
                                        </h3>
                                        <div className="mt-3 grid gap-2">
                                            {Object.entries(
                                                product.specifications,
                                            ).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex justify-between gap-3 text-xs"
                                                >
                                                    <span className="text-slate-500">
                                                        {key}
                                                    </span>
                                                    <strong className="text-right text-slate-700">
                                                        {value}
                                                    </strong>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {product.benefits?.length ? (
                                    <section>
                                        <h3 className="font-black text-slate-800">
                                            Beneficios
                                        </h3>
                                        <div className="mt-3 grid gap-2">
                                            {product.benefits.map((benefit) => (
                                                <p
                                                    key={benefit}
                                                    className="flex items-start gap-2 text-xs text-slate-600"
                                                >
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                                                        <Check className="size-3" />
                                                    </span>
                                                    {benefit}
                                                </p>
                                            ))}
                                        </div>
                                    </section>
                                ) : null}
                            </div>
                        )}

                        {product.description && (
                            <details className="mt-5 rounded-xl border border-cyan-100 px-4 py-3">
                                <summary className="cursor-pointer text-sm font-black text-slate-800">
                                    Descripción completa
                                </summary>
                                <p className="mt-3 max-h-28 overflow-y-auto text-sm leading-6 whitespace-pre-line text-slate-600">
                                    {product.description}
                                </p>
                            </details>
                        )}

                        {(product.warranty_info ||
                            product.shipping_info ||
                            product.payment_info) && (
                            <div className="mt-5 grid gap-2 rounded-2xl bg-cyan-50 p-3 sm:grid-cols-3">
                                {product.warranty_info && (
                                    <InfoItem
                                        icon={ShieldCheck}
                                        title="Garantía"
                                        text={product.warranty_info}
                                    />
                                )}
                                {product.shipping_info && (
                                    <InfoItem
                                        icon={Truck}
                                        title="Envío"
                                        text={product.shipping_info}
                                    />
                                )}
                                {product.payment_info && (
                                    <InfoItem
                                        icon={CreditCard}
                                        title="Pago"
                                        text={product.payment_info}
                                    />
                                )}
                            </div>
                        )}

                        <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            <Form {...addToCart.form()} className="contents">
                                <input
                                    type="hidden"
                                    name="product_id"
                                    value={product.id}
                                />
                                <input
                                    type="hidden"
                                    name="quantity"
                                    value="1"
                                />
                                <button
                                    disabled={product.stock < 1}
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 font-black text-slate-950 disabled:opacity-40"
                                >
                                    <ShoppingCart className="size-5" />
                                    Agregar al carrito
                                </button>
                            </Form>
                            <Link
                                href={show(product.slug)}
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-200 font-bold text-cyan-700"
                            >
                                Ver página completa
                                <ExternalLink className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoItem({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof ShieldCheck;
    title: string;
    text: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-xl bg-white/75 p-2.5">
            <Icon className="size-5 shrink-0 text-cyan-600" />
            <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-700">{title}</p>
                <p className="truncate text-[10px] text-slate-500" title={text}>
                    {text}
                </p>
            </div>
        </div>
    );
}
