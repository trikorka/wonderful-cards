import { ItemView, WorkspaceLeaf, Component } from 'obsidian';
import type WonderfulCardsPlugin from './main';
import { CardRenderer } from './CardRenderer';
import type { CatalogItem } from './types';

export const VIEW_TYPE_CARD_PREVIEW = 'wc-card-preview-view';

export class CardPreviewView extends ItemView {
    plugin: WonderfulCardsPlugin;
    private catalogItem: CatalogItem | null = null;
    private fromCatalog: boolean = false;
    private component: Component;

    constructor(leaf: WorkspaceLeaf, plugin: WonderfulCardsPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.component = new Component();
    }

    getViewType(): string { return VIEW_TYPE_CARD_PREVIEW; }
    getDisplayText(): string {
        return this.catalogItem ? this.catalogItem.item.name : 'Превью карточки';
    }
    getIcon(): string { return 'eye'; }

    async onOpen() {
        this.component.load();
        if (this.catalogItem) {
            await this.renderCard();
        }
    }

    async onClose() {
        this.component.unload();
    }

    async showCard(entry: CatalogItem, fromCatalog: boolean = false) {
        this.catalogItem = entry;
        this.fromCatalog = fromCatalog;
        await this.renderCard();
    }

    private async renderCard() {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass('wc-preview-container');

        // Back button
        if (this.fromCatalog) {
            const backBtn = container.createEl('button', {
                cls: 'wc-preview-back-btn',
                text: '← Назад к каталогу'
            });
            backBtn.addEventListener('click', () => {
                this.plugin.openCatalog();
            });
        }

        // Card
        if (this.catalogItem) {
            const cardWrap = container.createEl('div', { cls: 'wc-preview-card-wrap' });
            await CardRenderer.render(
                this.app,
                this.catalogItem.sourceYaml,
                cardWrap,
                '',
                this.component
            );
        }
    }
}
