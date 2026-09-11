export type SoftwareProgram = {
    id: number;
    name: string;
    slug: string;
    category: string;
    platform: string | null;
    version: string | null;
    license_type: string;
    price: string | null;
    short_description: string;
    description: string | null;
    requirements: string | null;
    is_own: boolean;
    is_featured: boolean;
    is_active: boolean;
    downloads: number;
    image_url: string | null;
};
