export type CategorySummary = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    is_active: boolean;
    sort_order: number;
    children_count?: number;
    parent?: { id: number; name: string } | null;
};

export type ParentCategory = Pick<CategorySummary, 'id' | 'name'>;
