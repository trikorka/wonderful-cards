import { PluginSettingTab, App, Setting, Notice } from 'obsidian';
import type WonderfulCardsPlugin from './main';
import { CardEditModal } from './CardEditModal';
import { t, setLang } from './i18n';
import type { Lang } from './i18n';

export class WonderfulCardsSettingsTab extends PluginSettingTab {
    plugin: WonderfulCardsPlugin;

    constructor(app: App, plugin: WonderfulCardsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        this.renderSettings();
    }

    private renderSettings(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Language selector
        new Setting(containerEl)
            .setName(t('settings.language'))
            .setDesc(t('settings.language-desc'))
            .addDropdown(d => d
                .addOptions({ 'en': 'English', 'ru': 'Русский' })
                .setValue(this.plugin.catalogStore.getLang())
                .onChange((value) => {
                    void (async () => {
                        const lang = value as Lang;
                        setLang(lang);
                        await this.plugin.catalogStore.setLang(lang);
                        this.renderSettings();
                    })();
                }));

        new Setting(containerEl)
            .setName(t('settings.heading'))
            .setHeading();

        // Add button
        new Setting(containerEl)
            .setName(t('settings.add-card'))
            .setDesc(t('settings.add-card-desc'))
            .addButton(btn => btn
                .setButtonText(t('settings.add-btn'))
                .setCta()
                .onClick(() => {
                    new CardEditModal(this.app, this.plugin, null, (item, yaml) => {
                        void (async () => {
                            await this.plugin.catalogStore.add(item, yaml);
                            new Notice(t('settings.added-notice', { name: item.name }));
                            this.renderSettings();
                        })();
                    }).open();
                }));

        // Separator
        containerEl.createEl('hr');

        // List
        const catalog = this.plugin.catalogStore.getAll();

        if (catalog.length === 0) {
            containerEl.createEl('p', {
                text: t('settings.empty'),
                cls: 'wc-settings-empty'
            });
            return;
        }

        for (const entry of catalog) {
            const s = new Setting(containerEl)
                .setName(entry.item.name)
                .setDesc(`${entry.item.type || t('card.default-type')}${entry.item.rarity ? ', ' + entry.item.rarity : ''}`);

            s.addButton(btn => btn
                .setButtonText(t('settings.edit-btn'))
                .onClick(() => {
                    new CardEditModal(this.app, this.plugin, entry, (item, yaml) => {
                        void (async () => {
                            await this.plugin.catalogStore.update(entry.id, item, yaml);
                            new Notice(t('settings.updated-notice', { name: item.name }));
                            this.renderSettings();
                        })();
                    }).open();
                }));

            s.addButton(btn => btn
                .setButtonText(t('settings.delete-btn'))
                .setDestructive()
                .onClick(() => {
                    void (async () => {
                        await this.plugin.catalogStore.remove(entry.id);
                        new Notice(t('settings.deleted-notice', { name: entry.item.name }));
                        this.renderSettings();
                    })();
                }));
        }
    }
}
