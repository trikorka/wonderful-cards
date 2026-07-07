import { App, Modal, Setting, Notice, parseYaml, stringifyYaml } from 'obsidian';
import type { MagicItem, CatalogItem } from './types';
import type WonderfulCardsPlugin from './main';
import { t } from './i18n';

export class CardEditModal extends Modal {
    plugin: WonderfulCardsPlugin;
    private editingItem: CatalogItem | null;
    private mode: 'yaml' | 'gui' = 'gui';
    private item: MagicItem;
    private yamlText: string;
    private onSave: (item: MagicItem, yaml: string) => void;

    constructor(app: App, plugin: WonderfulCardsPlugin, editingItem: CatalogItem | null, onSave: (item: MagicItem, yaml: string) => void) {
        super(app);
        this.plugin = plugin;
        this.editingItem = editingItem;
        this.onSave = onSave;

        if (editingItem) {
            this.item = { ...editingItem.item };
            this.yamlText = editingItem.sourceYaml;
        } else {
            this.item = {
                name: '', title_en: '', image: '',
                type: t('card.default-type'), subtype: '', rarity: '',
                attunement: false, price: '', description: '',
                text_align: t('template.default-align')
            };
            this.yamlText = '';
        }
    }

    onOpen() {
        this.modalEl.addClass('wc-edit-modal');
        this.render();
    }

    onClose() {
        this.contentEl.empty();
    }

    private render() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: this.editingItem ? t('modal.title-edit') : t('modal.title-new') });

        // Mode toggle
        const toggleWrap = contentEl.createEl('div', { cls: 'wc-edit-mode-toggle' });
        const guiBtn = toggleWrap.createEl('button', {
            text: t('modal.mode-gui'),
            cls: `wc-edit-mode-btn ${this.mode === 'gui' ? 'wc-edit-mode-btn--active' : ''}`
        });
        const yamlBtn = toggleWrap.createEl('button', {
            text: t('modal.mode-yaml'),
            cls: `wc-edit-mode-btn ${this.mode === 'yaml' ? 'wc-edit-mode-btn--active' : ''}`
        });

        guiBtn.addEventListener('click', () => {
            if (this.mode === 'yaml') {
                this.syncYamlToItem();
            }
            this.mode = 'gui';
            this.render();
        });

        yamlBtn.addEventListener('click', () => {
            if (this.mode === 'gui') {
                this.syncItemToYaml();
            }
            this.mode = 'yaml';
            this.render();
        });

        // Content area
        const body = contentEl.createEl('div', { cls: 'wc-edit-body' });

        if (this.mode === 'gui') {
            this.renderGUI(body);
        } else {
            this.renderYAML(body);
        }

        // Buttons
        new Setting(contentEl)
            .addButton(btn => btn.setButtonText(t('modal.save')).setCta().onClick(() => {
                if (this.mode === 'yaml') this.syncYamlToItem();
                if (this.mode === 'gui') this.syncItemToYaml();
                if (!this.item.name) {
                    new Notice(t('modal.name-required'));
                    return;
                }
                this.onSave(this.item, this.yamlText);
                this.close();
            }))
            .addButton(btn => btn.setButtonText(t('modal.cancel')).onClick(() => this.close()));
    }

    private renderGUI(container: HTMLElement) {
        new Setting(container).setName(t('modal.field-name')).addText(tx =>
            tx.setValue(this.item.name).onChange(v => { this.item.name = v; }));

        new Setting(container).setName(t('modal.field-title-en')).addText(tx =>
            tx.setValue(this.item.title_en || '').onChange(v => { this.item.title_en = v; }));

        new Setting(container).setName(t('modal.field-image')).addText(tx =>
            tx.setValue(this.item.image || '').onChange(v => { this.item.image = v; }));

        new Setting(container).setName(t('modal.field-type')).addText(tx =>
            tx.setValue(this.item.type).onChange(v => { this.item.type = v || t('card.default-type'); }));

        new Setting(container).setName(t('modal.field-subtype')).addText(tx =>
            tx.setValue(this.item.subtype || '').onChange(v => { this.item.subtype = v; }));

        new Setting(container).setName(t('modal.field-rarity')).addText(tx =>
            tx.setValue(this.item.rarity || '').onChange(v => { this.item.rarity = v; }));

        new Setting(container).setName(t('modal.field-attunement')).addToggle(tg =>
            tg.setValue(this.item.attunement === true || String(this.item.attunement).toLowerCase() === 'true')
                .onChange(v => { this.item.attunement = v; }));

        new Setting(container).setName(t('modal.field-price')).addText(tx =>
            tx.setValue(this.item.price || '').onChange(v => { this.item.price = v; }));

        new Setting(container).setName(t('modal.field-align')).addDropdown(d => {
            const opts: Record<string, string> = {
                'justify': t('modal.align-justify'),
                'left': t('modal.align-left'),
                'center': t('modal.align-center'),
                'right': t('modal.align-right'),
            };
            d.addOptions(opts);
            // Map legacy RU keys to standard keys
            const legacyMap: Record<string, string> = {
                'ширина': 'justify', 'лево': 'left', 'центр': 'center', 'право': 'right'
            };
            const currentVal = this.item.text_align?.toLowerCase().trim() || 'justify';
            const normalizedVal = legacyMap[currentVal] || currentVal;
            d.setValue(normalizedVal);
            d.onChange(v => { this.item.text_align = v; });
        });

        new Setting(container).setName(t('modal.field-description')).addTextArea(tx => {
            tx.inputEl.rows = 10;
            tx.inputEl.addClass('wc-edit-textarea');
            tx.setValue(this.item.description || '').onChange(v => { this.item.description = v; });
        });
    }

    private renderYAML(container: HTMLElement) {
        if (!this.yamlText && this.item.name) {
            this.syncItemToYaml();
        }
        const ta = container.createEl('textarea', { cls: 'wc-edit-yaml-area' });
        ta.value = this.yamlText;
        ta.rows = 20;
        ta.addEventListener('input', () => {
            this.yamlText = ta.value;
        });
    }

    private syncItemToYaml() {
        const obj: Record<string, unknown> = {};
        if (this.item.name) obj.name = this.item.name;
        if (this.item.title_en) obj.title_en = this.item.title_en;
        if (this.item.image) obj.image = this.item.image;
        obj.type = this.item.type || t('card.default-type');
        if (this.item.subtype) obj.subtype = this.item.subtype;
        if (this.item.rarity) obj.rarity = this.item.rarity;
        obj.attunement = this.item.attunement === true || String(this.item.attunement).toLowerCase() === 'true';
        if (this.item.price) obj.price = this.item.price;
        if (this.item.text_align) obj.text_align = this.item.text_align;
        if (this.item.description) obj.description = this.item.description;
        this.yamlText = stringifyYaml(obj).trim();
    }

    private syncYamlToItem() {
        try {
            const parsed = parseYaml(this.yamlText) as MagicItem;
            if (parsed) {
                this.item = { ...this.item, ...parsed };
            }
        } catch {
            new Notice(t('modal.yaml-error'));
        }
    }
}
