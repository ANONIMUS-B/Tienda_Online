import type { Product } from './product';
export type CartItem = {
    product: Product;
    quantity: number;
    unit_price: number;
    total: number;
};
export type OrderItem = {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    unit_price: string;
    total: string;
};
export type Order = {
    id: number;
    number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    shipping_method: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    district: string;
    province: string;
    department: string;
    subtotal: string;
    shipping_total: string;
    total: string;
    created_at: string;
    items: OrderItem[];
    items_count?: number;
};
