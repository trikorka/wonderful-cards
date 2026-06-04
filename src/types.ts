export interface MagicItem {
    name: string;
    title_en?: string;
    image?: string;
    type: string;
    subtype?: string;
    rarity?: string;
    attunement?: boolean | string;
    price?: string;
    description: string;
    width?: number;
    text_align?: string;
}

export interface CatalogItem {
    id: string;
    item: MagicItem;
    sourceYaml: string;
}

export interface PluginData {
    catalog: CatalogItem[];
}
