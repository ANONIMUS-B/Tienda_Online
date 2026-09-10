export type BrandSummary = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo_path: string | null;
    website_url: string | null;
    is_active: boolean;
    sort_order: number;
};
