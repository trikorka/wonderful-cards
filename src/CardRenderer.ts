import { App, parseYaml, MarkdownRenderer, Component, Notice } from 'obsidian';
import type { MagicItem } from './types';

function getRarityClass(rarity?: string): string {
    if (!rarity) return 'wc-rarity--default';
    const r = rarity.toLowerCase().trim();
    if (r === 'обычный' || r === 'обычное' || r === 'обычная') return 'wc-rarity--common';
    if (r === 'необычный' || r === 'необычное' || r === 'необычная') return 'wc-rarity--uncommon';
    if (r === 'редкий' || r === 'редкое' || r === 'редкая') return 'wc-rarity--rare';
    if (r.startsWith('очень редк')) return 'wc-rarity--veryrare';
    if (r === 'легендарный' || r === 'легендарное' || r === 'легендарная') return 'wc-rarity--legendary';
    if (r === 'артефакт') return 'wc-rarity--artifact';
    return 'wc-rarity--default';
}

function getPriceCurrencyClass(price?: string): string {
    if (!price) return '';
    const p = price.toLowerCase().trim();
    if (p.endsWith('зм')) return 'wc-price--gold';
    if (p.endsWith('см')) return 'wc-price--silver';
    if (p.endsWith('мм')) return 'wc-price--copper';
    if (p.endsWith('эм')) return 'wc-price--electrum';
    return 'wc-price--gold';
}

export interface CardRenderOptions {
    onAddToCatalog?: (item: MagicItem, yaml: string) => void;
    onRemoveFromCatalog?: (item: MagicItem) => void;
    isInCatalog?: boolean;
    compact?: boolean;
}

export class CardRenderer {
    static async render(
        app: App,
        source: string,
        el: HTMLElement,
        sourcePath: string,
        component: Component,
        options?: CardRenderOptions
    ) {
        let item: MagicItem;
        try {
            item = parseYaml(source);
        } catch (e) {
            el.createEl('div', { text: 'Ошибка парсинга YAML карточки предмета.', cls: 'wc-card-error' });
            return;
        }

        el.addClass('wc-render-container');

        const rarityClass = getRarityClass(item.rarity);
        const card = el.createEl('div', { cls: `wc-card ${rarityClass}` });

        // Width
        if (!options?.compact) {
            const width = item.width && item.width >= 400 ? item.width : 400;
            card.style.width = `${width}px`;
            card.style.maxWidth = '100%';
        }

        // Click handler
        if (options?.onCardClick) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                options.onCardClick!(item);
            });
        }

        // Top accent bar
        card.createEl('div', { cls: 'wc-card-accent' });

        if (!options?.compact && (options?.onAddToCatalog || options?.onRemoveFromCatalog)) {
            // Container for our block action button
            const actionContainer = el.createEl('div', { cls: 'wc-block-action-container' });
            
            const addBtn = actionContainer.createEl('div', {
                cls: `clickable-icon wc-block-action-btn ${options.isInCatalog ? 'wc-block-action-btn--added' : ''}`,
                attr: { 'aria-label': options.isInCatalog ? 'Удалить из каталога' : 'Добавить в каталог' }
            });

            const renderIcon = (isAdded: boolean) => {
                if (isAdded) {
                    addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';
                } else {
                    addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path><line x1="12" y1="7" x2="12" y2="13"></line><line x1="9" y1="10" x2="15" y2="10"></line></svg>';
                }
            };

            let isAdded = !!options.isInCatalog;
            renderIcon(isAdded);

            addBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (isAdded && options.onRemoveFromCatalog) {
                    await options.onRemoveFromCatalog(item);
                    isAdded = false;
                    addBtn.classList.remove('wc-block-action-btn--added');
                    addBtn.setAttribute('aria-label', 'Добавить в каталог');
                    renderIcon(isAdded);
                    new Notice(`«${item.name}» удалена из каталога`);
                } else if (!isAdded && options.onAddToCatalog) {
                    await options.onAddToCatalog(item, source);
                    isAdded = true;
                    addBtn.classList.add('wc-block-action-btn--added');
                    addBtn.setAttribute('aria-label', 'Удалить из каталога');
                    renderIcon(isAdded);
                    new Notice(`«${item.name}» добавлена в каталог`);
                }
            });
        }

        // Click handler
        if (options?.onCardClick) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).closest('.wc-card-action-btn')) return;
                options.onCardClick!(item);
            });
        }

        // Top accent bar
        card.createEl('div', { cls: 'wc-card-accent' });

        // Header row
        const headerRow = card.createEl('div', { cls: 'wc-card-header-row' });
        const nameBlock = headerRow.createEl('div', { cls: 'wc-card-name-block' });
        nameBlock.createEl('div', { text: item.name || 'Неизвестный предмет', cls: 'wc-card-name' });
        if (item.title_en) {
            nameBlock.createEl('div', { text: `[${item.title_en}]`, cls: 'wc-card-name-en' });
        }

        if (item.price) {
            const currClass = getPriceCurrencyClass(item.price);
            headerRow.createEl('div', { text: item.price, cls: `wc-card-price-badge ${currClass}` });
        }

        // Meta line
        const typeStr = item.type || 'Чудесный предмет';
        let metaText = typeStr;
        if (item.subtype) metaText += ` (${item.subtype})`;
        if (item.rarity) metaText += `, ${item.rarity}`;
        if (item.attunement === true || String(item.attunement).toLowerCase() === 'true') {
            metaText += ` (требуется настройка)`;
        } else if (typeof item.attunement === 'string' && item.attunement.toLowerCase() !== 'false' && item.attunement.trim() !== '') {
            let att = item.attunement;
            if (att.toLowerCase().includes('требуется настройка')) {
                att = att.replace(/Требуется настройка/gi, 'требуется настройка');
            }
            metaText += ` (${att})`;
        }
        card.createEl('div', { text: metaText, cls: 'wc-card-meta' });

        if (options?.compact) return;

        // Divider
        card.createEl('div', { cls: 'wc-card-divider' });

        // Image
        if (item.image) {
            const imageWrap = card.createEl('div', { cls: 'wc-card-image' });
            let imageString = item.image;
            if (!imageString.startsWith('![')) {
                if (imageString.startsWith('http')) {
                    imageString = `![](${imageString})`;
                } else {
                    imageString = `![[${imageString}]]`;
                }
            }
            await MarkdownRenderer.render(app, imageString, imageWrap, sourcePath, component);
        }

        // Description
        if (item.description) {
            const descDiv = card.createEl('div', { cls: 'wc-card-description' });
            const alignMap: Record<string, string> = {
                'left': 'left', 'лево': 'left',
                'center': 'center', 'центр': 'center',
                'right': 'right', 'право': 'right',
                'justify': 'justify', 'ширина': 'justify',
            };
            const align = item.text_align ? alignMap[item.text_align.toLowerCase().trim()] || 'justify' : 'justify';
            descDiv.style.textAlign = align;
            await MarkdownRenderer.render(app, item.description, descDiv, sourcePath, component);
        }
    }
}
