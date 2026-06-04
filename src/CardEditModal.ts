import { App, Modal, Setting, Notice, parseYaml, stringifyYaml } from 'obsidian';
import type { MagicItem, CatalogItem } from './types';
import type WonderfulCardsPlugin from './main';

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
                type: 'Чудесный предмет', subtype: '', rarity: '',
                attunement: false, price: '', description: '',
                text_align: 'ширина'
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

        contentEl.createEl('h2', { text: this.editingItem ? 'Редактировать карточку' : 'Новая карточка' });

        // Mode toggle
        const toggleWrap = contentEl.createEl('div', { cls: 'wc-edit-mode-toggle' });
        const guiBtn = toggleWrap.createEl('button', {
            text: 'Интерфейс',
            cls: `wc-edit-mode-btn ${this.mode === 'gui' ? 'wc-edit-mode-btn--active' : ''}`
        });
        const yamlBtn = toggleWrap.createEl('button', {
            text: 'YAML',
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
            .addButton(btn => btn.setButtonText('Сохранить').setCta().onClick(() => {
                if (this.mode === 'yaml') this.syncYamlToItem();
                if (this.mode === 'gui') this.syncItemToYaml();
                if (!this.item.name) {
                    new Notice('Введите название предмета');
                    return;
                }
                this.onSave(this.item, this.yamlText);
                this.close();
            }))
            .addButton(btn => btn.setButtonText('Отмена').onClick(() => this.close()));
    }

    private renderGUI(container: HTMLElement) {
        new Setting(container).setName('Название предмета').addText(t =>
            t.setValue(this.item.name).onChange(v => { this.item.name = v; }));

        new Setting(container).setName('Item title (Англ.)').addText(t =>
            t.setValue(this.item.title_en || '').onChange(v => { this.item.title_en = v; }));

        new Setting(container).setName('Изображение').addText(t =>
            t.setValue(this.item.image || '').onChange(v => { this.item.image = v; }));

        new Setting(container).setName('Тип').addText(t =>
            t.setValue(this.item.type).onChange(v => { this.item.type = v || 'Чудесный предмет'; }));

        new Setting(container).setName('Подтип').addText(t =>
            t.setValue(this.item.subtype || '').onChange(v => { this.item.subtype = v; }));

        new Setting(container).setName('Редкость').addText(t =>
            t.setValue(this.item.rarity || '').onChange(v => { this.item.rarity = v; }));

        new Setting(container).setName('Требуется настройка').addToggle(t =>
            t.setValue(this.item.attunement === true || String(this.item.attunement).toLowerCase() === 'true')
                .onChange(v => { this.item.attunement = v; }));

        new Setting(container).setName('Цена').addText(t =>
            t.setValue(this.item.price || '').onChange(v => { this.item.price = v; }));

        new Setting(container).setName('Выравнивание текста').addDropdown(d =>
            d.addOptions({ 'ширина': 'По ширине', 'лево': 'По левому краю', 'центр': 'По центру', 'право': 'По правому краю' })
                .setValue(this.item.text_align || 'ширина')
                .onChange(v => { this.item.text_align = v; }));

        new Setting(container).setName('Описание').addTextArea(t => {
            t.inputEl.rows = 10;
            t.inputEl.addClass('wc-edit-textarea');
            t.setValue(this.item.description || '').onChange(v => { this.item.description = v; });
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
        const obj: Record<string, any> = {};
        if (this.item.name) obj.name = this.item.name;
        if (this.item.title_en) obj.title_en = this.item.title_en;
        if (this.item.image) obj.image = this.item.image;
        obj.type = this.item.type || 'Чудесный предмет';
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
        } catch (e) {
            new Notice('Ошибка парсинга YAML');
        }
    }
}
