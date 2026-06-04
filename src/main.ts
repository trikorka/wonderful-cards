import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CardRenderer } from './CardRenderer';
import { CatalogStore } from './CatalogStore';
import { CatalogView, VIEW_TYPE_CATALOG } from './CatalogView';
import { CardPreviewView, VIEW_TYPE_CARD_PREVIEW } from './CardPreviewView';
import { WonderfulCardsSettingsTab } from './SettingsTab';
import type { CatalogItem } from './types';

export default class WonderfulCardsPlugin extends Plugin {
    catalogStore: CatalogStore;

    async onload() {
        this.catalogStore = new CatalogStore(this);
        await this.catalogStore.load();

        this.registerView(VIEW_TYPE_CATALOG, (leaf) => new CatalogView(leaf, this));
        this.registerView(VIEW_TYPE_CARD_PREVIEW, (leaf) => new CardPreviewView(leaf, this));

        this.addSettingTab(new WonderfulCardsSettingsTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor('itemcard', (source, el, ctx) => {
            const itemMatch = source.match(/name:\s*["']?([^"'\n]+)["']?/);
            const itemName = itemMatch ? itemMatch[1].trim() : '';
            const isInCatalog = this.catalogStore.has(itemName);

            CardRenderer.render(this.app, source, el, ctx.sourcePath, this, {
                isInCatalog,
                onAddToCatalog: async (item, yaml) => {
                    await this.catalogStore.add(item, yaml);
                },
                onRemoveFromCatalog: async (item) => {
                    const c = this.catalogStore.findByName(item.name);
                    if (c) {
                        await this.catalogStore.remove(c.id);
                    }
                },
                onCardClick: (item) => {
                    const entry = this.catalogStore.findByName(item.name);
                    if (entry) {
                        this.openCardPreview(entry);
                    } else {
                        // If not in catalog, create a temporary entry for preview
                        this.openCardPreview({ id: 'temp', item, sourceYaml: source });
                    }
                }
            });
        });

        this.addCommand({
            id: 'insert-magic-item-template',
            name: 'Вставить шаблон магического предмета',
            editorCallback: (editor, view) => {
                const template = `\`\`\`itemcard
name: ""
title_en: ""
image: ""
type: "Чудесный предмет"
subtype: ""
rarity: ""
attunement: false
price: ""
text_align: "ширина"
description: |
  
\`\`\`
`;
                editor.replaceSelection(template);
            }
        });

        this.addCommand({
            id: 'open-wonderful-cards-catalog',
            name: 'Открыть каталог карточек',
            callback: () => this.openCatalog()
        });

        // Style `wc:Название` inline code in Reading Mode
        this.registerMarkdownPostProcessor((element) => {
            element.querySelectorAll('code').forEach(code => {
                if (code.textContent && code.textContent.trim().startsWith('wc:')) {
                    code.addClass('wc-clickable-code');
                }
            });
        });

        // Register global click handler for inline code and links
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            const target = evt.target as HTMLElement;
            
            // Helper to open preview
            const triggerPreview = (itemName: string) => {
                const entry = this.catalogStore.findByName(itemName);
                if (entry) {
                    this.openCardPreview(entry);
                } else {
                    new Notice(`Карточка «${itemName}» не найдена в каталоге`);
                }
            };

            // 1. Handle Reading Mode
            const readingCode = target.closest('code.wc-clickable-code') as HTMLElement;
            if (readingCode) {
                let text = readingCode.textContent || '';
                text = text.replace(/`/g, '').trim();
                if (text.startsWith('wc:')) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    triggerPreview(text.substring(3).trim());
                    return;
                }
            }

            // 2. Handle Live Preview
            if (evt.ctrlKey || evt.metaKey) {
                const cmInline = target.closest('.cm-inline-code') as HTMLElement;
                if (cmInline) {
                    let text = cmInline.textContent || '';
                    
                    // If they clicked the backtick itself, try to get the text from the adjacent span
                    if (text === '`') {
                        if (cmInline.nextElementSibling?.classList.contains('cm-inline-code')) {
                            text += cmInline.nextElementSibling.textContent || '';
                        } else if (cmInline.previousElementSibling?.classList.contains('cm-inline-code')) {
                            text = (cmInline.previousElementSibling.textContent || '') + text;
                        }
                    }
                    
                    text = text.replace(/`/g, '').trim();
                    if (text.startsWith('wc:')) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        triggerPreview(text.substring(3).trim());
                        return;
                    }
                }
            }

            // 3. Fallback for previously supported links
            const link = target.closest('.internal-link, .external-link') as HTMLElement;
            if (link) {
                const href = link.getAttribute('data-href') || link.getAttribute('href');
                if (href && href.startsWith('wc:')) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    triggerPreview(href.substring(3).trim());
                }
            }
        }, { capture: true });
    }

    onunload() {
        // Clean up
    }

    async openCatalog() {
        let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CATALOG)[0];
        if (!leaf) {
            const rightLeaf = this.app.workspace.getRightLeaf(false);
            if (rightLeaf) {
                await rightLeaf.setViewState({ type: VIEW_TYPE_CATALOG, active: true });
                leaf = rightLeaf;
            } else {
                return; // Fallback if no right leaf is available
            }
        }
        this.app.workspace.revealLeaf(leaf);
    }

    async openCardPreview(entry: CatalogItem, fromCatalog: boolean = false) {
        let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CARD_PREVIEW)[0];
        if (!leaf) {
             const rightLeaf = this.app.workspace.getRightLeaf(false);
             if(rightLeaf) {
                 await rightLeaf.setViewState({ type: VIEW_TYPE_CARD_PREVIEW, active: true });
                 leaf = rightLeaf;
             } else {
                 return;
             }
        }
        this.app.workspace.revealLeaf(leaf);
        if (leaf.view instanceof CardPreviewView) {
            leaf.view.showCard(entry, fromCatalog);
        }
    }
}
