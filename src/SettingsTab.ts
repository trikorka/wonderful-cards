import { PluginSettingTab, App, Setting, Notice } from 'obsidian';
import type WonderfulCardsPlugin from './main';
import { CardEditModal } from './CardEditModal';

export class WonderfulCardsSettingsTab extends PluginSettingTab {
    plugin: WonderfulCardsPlugin;

    constructor(app: App, plugin: WonderfulCardsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Wonderful Cards — Каталог')
            .setHeading();

        // Add button
        new Setting(containerEl)
            .setName('Добавить карточку')
            .setDesc('Создать новую карточку магического предмета')
            .addButton(btn => btn
                .setButtonText('+ Добавить')
                .setCta()
                .onClick(() => {
                    void (async () => {
                        new CardEditModal(this.app, this.plugin, null, async (item, yaml) => {
                            await this.plugin.catalogStore.add(item, yaml);
                            new Notice(`«${item.name}» добавлена в каталог`);
                            this.display();
                        }).open();
                    })();
                }));

        // Separator
        containerEl.createEl('hr');

        // List
        const catalog = this.plugin.catalogStore.getAll();

        if (catalog.length === 0) {
            containerEl.createEl('p', {
                text: 'Каталог пуст. Добавьте первую карточку!',
                cls: 'wc-settings-empty'
            });
            return;
        }

        for (const entry of catalog) {
            const s = new Setting(containerEl)
                .setName(entry.item.name)
                .setDesc(`${entry.item.type || 'Чудесный предмет'}${entry.item.rarity ? ', ' + entry.item.rarity : ''}`);

            s.addButton(btn => btn
                .setButtonText('Редактировать')
                .onClick(() => {
                    void (async () => {
                        new CardEditModal(this.app, this.plugin, entry, async (item, yaml) => {
                            await this.plugin.catalogStore.update(entry.id, item, yaml);
                            new Notice(`«${item.name}» обновлена`);
                            this.display();
                        }).open();
                    })();
                }));

            s.addButton(btn => btn
                .setButtonText('Удалить')
                .setDestructive()
                .onClick(() => {
                    void (async () => {
                        await this.plugin.catalogStore.remove(entry.id);
                        new Notice(`«${entry.item.name}» удалена из каталога`);
                        this.display();
                    })();
                }));
        }
    }
}
