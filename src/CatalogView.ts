import { ItemView, WorkspaceLeaf, Component } from 'obsidian';
import type WonderfulCardsPlugin from './main';
import { CardRenderer } from './CardRenderer';
import { t } from './i18n';

export const VIEW_TYPE_CATALOG = 'wc-catalog-view';

export class CatalogView extends ItemView {
    plugin: WonderfulCardsPlugin;
    private searchQuery: string = '';
    private component: Component;

    constructor(leaf: WorkspaceLeaf, plugin: WonderfulCardsPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.component = new Component();
    }

    getViewType(): string { return VIEW_TYPE_CATALOG; }
    getDisplayText(): string { return t('catalog.title'); }
    getIcon(): string { return 'scroll'; }

    async onOpen() {
        this.component.load();
        void this.renderView();
    }

    async onClose() {
        this.component.unload();
    }

    async renderView() {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass('wc-catalog-container');

        // Header
        const header = container.createEl('div', { cls: 'wc-catalog-header' });
        header.createEl('h3', { text: t('catalog.header') });

        // Search
        const searchWrap = header.createEl('div', { cls: 'wc-catalog-search-wrap' });
        const searchInput = searchWrap.createEl('input', {
            cls: 'wc-catalog-search',
            attr: { type: 'text', placeholder: t('catalog.search-placeholder') }
        });
        searchInput.value = this.searchQuery;
        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            void this.renderGrid(grid);
        });

        // Grid
        const grid = container.createEl('div', { cls: 'wc-catalog-grid' });
        await this.renderGrid(grid);
    }

    async renderGrid(grid: HTMLElement) {
        grid.empty();
        const items = this.plugin.catalogStore.search(this.searchQuery);

        if (items.length === 0) {
            grid.createEl('div', {
                text: this.searchQuery ? t('catalog.not-found') : t('catalog.empty'),
                cls: 'wc-catalog-empty'
            });
            return;
        }

        for (const entry of items) {
            const cardWrap = grid.createEl('div', { cls: 'wc-catalog-mini-card-wrap' });
            await CardRenderer.render(
                this.app,
                entry.sourceYaml,
                cardWrap,
                '',
                this.component,
                {
                    compact: true,
                    onCardClick: () => {
                        void this.plugin.openCardPreview(entry, true);
                    }
                }
            );
        }
    }

    async refresh() {
        await this.renderView();
    }
}
