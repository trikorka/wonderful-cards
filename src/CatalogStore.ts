import { parseYaml } from 'obsidian';
import type { MagicItem, CatalogItem, PluginData } from './types';
import type WonderfulCardsPlugin from './main';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export class CatalogStore {
    private plugin: WonderfulCardsPlugin;
    private data: PluginData;

    constructor(plugin: WonderfulCardsPlugin) {
        this.plugin = plugin;
        this.data = { catalog: [] };
    }

    async load(): Promise<void> {
        const saved = await this.plugin.loadData() as Partial<PluginData> | null;
        if (saved?.catalog) {
            this.data = saved as PluginData;
        }
    }

    async save(): Promise<void> {
        await this.plugin.saveData(this.data);
    }

    getAll(): CatalogItem[] {
        return this.data.catalog;
    }

    getById(id: string): CatalogItem | undefined {
        return this.data.catalog.find(c => c.id === id);
    }

    findByName(name: string): CatalogItem | undefined {
        return this.data.catalog.find(c =>
            c.item.name.toLowerCase() === name.toLowerCase()
        );
    }

    search(query: string): CatalogItem[] {
        if (!query.trim()) return this.data.catalog;
        const q = query.toLowerCase().trim();
        return this.data.catalog.filter(c =>
            c.item.name.toLowerCase().includes(q) ||
            (c.item.title_en && c.item.title_en.toLowerCase().includes(q))
        );
    }

    async add(item: MagicItem, sourceYaml: string): Promise<CatalogItem> {
        const entry: CatalogItem = {
            id: generateId(),
            item: { ...item },
            sourceYaml,
        };
        this.data.catalog.push(entry);
        await this.save();
        return entry;
    }

    async addFromYaml(yaml: string): Promise<CatalogItem> {
        const item = parseYaml(yaml) as MagicItem;
        return this.add(item, yaml);
    }

    async update(id: string, item: MagicItem, sourceYaml: string): Promise<void> {
        const idx = this.data.catalog.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.data.catalog[idx].item = { ...item };
            this.data.catalog[idx].sourceYaml = sourceYaml;
            await this.save();
        }
    }

    async remove(id: string): Promise<void> {
        this.data.catalog = this.data.catalog.filter(c => c.id !== id);
        await this.save();
    }

    has(name: string): boolean {
        return this.data.catalog.some(c =>
            c.item.name.toLowerCase() === name.toLowerCase()
        );
    }
}
