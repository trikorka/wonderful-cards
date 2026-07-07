export type Lang = 'ru' | 'en';

let currentLang: Lang = 'en';

const en: Record<string, string> = {
    // Commands
    'cmd.insert-template': 'Insert magic item template',
    'cmd.open-catalog': 'Open card catalog',

    // Card Renderer
    'card.parse-error': 'Error parsing item card YAML.',
    'card.add-to-catalog': 'Add to catalog',
    'card.remove-from-catalog': 'Remove from catalog',
    'card.removed-notice': '"{name}" removed from catalog',
    'card.added-notice': '"{name}" added to catalog',
    'card.unknown-item': 'Unknown item',
    'card.default-type': 'Wondrous item',
    'card.requires-attunement': 'requires attunement',
    'card.not-found': 'Card "{name}" not found in catalog',

    // Settings
    'settings.heading': 'Catalog',
    'settings.add-card': 'Add card',
    'settings.add-card-desc': 'Create a new magic item card',
    'settings.add-btn': '+ Add',
    'settings.added-notice': '"{name}" added to catalog',
    'settings.empty': 'Catalog is empty. Add your first card!',
    'settings.edit-btn': 'Edit',
    'settings.updated-notice': '"{name}" updated',
    'settings.delete-btn': 'Delete',
    'settings.deleted-notice': '"{name}" removed from catalog',
    'settings.language': 'Language / Язык',
    'settings.language-desc': 'Select the plugin interface language',

    // Edit Modal
    'modal.title-edit': 'Edit card',
    'modal.title-new': 'New card',
    'modal.mode-gui': 'Interface',
    'modal.mode-yaml': 'YAML',
    'modal.save': 'Save',
    'modal.cancel': 'Cancel',
    'modal.name-required': 'Please enter the item name',
    'modal.field-name': 'Item name',
    'modal.field-title-en': 'English title',
    'modal.field-image': 'Image',
    'modal.field-type': 'Type',
    'modal.field-subtype': 'Subtype',
    'modal.field-rarity': 'Rarity',
    'modal.field-attunement': 'Requires attunement',
    'modal.field-price': 'Price',
    'modal.field-align': 'Text alignment',
    'modal.field-description': 'Description',
    'modal.align-justify': 'Justify',
    'modal.align-left': 'Left',
    'modal.align-center': 'Center',
    'modal.align-right': 'Right',
    'modal.yaml-error': 'YAML parsing error',

    // Template defaults
    'template.default-type': 'Wondrous item',
    'template.default-align': 'justify',

    // Catalog View
    'catalog.title': 'Card catalog',
    'catalog.header': 'Item catalog',
    'catalog.search-placeholder': 'Search by name...',
    'catalog.empty': 'Catalog is empty',
    'catalog.not-found': 'Nothing found',

    // Preview View
    'preview.title': 'Card preview',
    'preview.back': '← Back to catalog',
};

const ru: Record<string, string> = {
    // Commands
    'cmd.insert-template': 'Вставить шаблон магического предмета',
    'cmd.open-catalog': 'Открыть каталог карточек',

    // Card Renderer
    'card.parse-error': 'Ошибка парсинга YAML карточки предмета.',
    'card.add-to-catalog': 'Добавить в каталог',
    'card.remove-from-catalog': 'Удалить из каталога',
    'card.removed-notice': '«{name}» удалена из каталога',
    'card.added-notice': '«{name}» добавлена в каталог',
    'card.unknown-item': 'Неизвестный предмет',
    'card.default-type': 'Чудесный предмет',
    'card.requires-attunement': 'требуется настройка',
    'card.not-found': 'Карточка «{name}» не найдена в каталоге',

    // Settings
    'settings.heading': 'Каталог',
    'settings.add-card': 'Добавить карточку',
    'settings.add-card-desc': 'Создать новую карточку магического предмета',
    'settings.add-btn': '+ Добавить',
    'settings.added-notice': '«{name}» добавлена в каталог',
    'settings.empty': 'Каталог пуст. Добавьте первую карточку!',
    'settings.edit-btn': 'Редактировать',
    'settings.updated-notice': '«{name}» обновлена',
    'settings.delete-btn': 'Удалить',
    'settings.deleted-notice': '«{name}» удалена из каталога',
    'settings.language': 'Язык / Language',
    'settings.language-desc': 'Выберите язык интерфейса плагина',

    // Edit Modal
    'modal.title-edit': 'Редактировать карточку',
    'modal.title-new': 'Новая карточка',
    'modal.mode-gui': 'Интерфейс',
    'modal.mode-yaml': 'YAML',
    'modal.save': 'Сохранить',
    'modal.cancel': 'Отмена',
    'modal.name-required': 'Введите название предмета',
    'modal.field-name': 'Название предмета',
    'modal.field-title-en': 'Item title (Англ.)',
    'modal.field-image': 'Изображение',
    'modal.field-type': 'Тип',
    'modal.field-subtype': 'Подтип',
    'modal.field-rarity': 'Редкость',
    'modal.field-attunement': 'Требуется настройка',
    'modal.field-price': 'Цена',
    'modal.field-align': 'Выравнивание текста',
    'modal.field-description': 'Описание',
    'modal.align-justify': 'По ширине',
    'modal.align-left': 'По левому краю',
    'modal.align-center': 'По центру',
    'modal.align-right': 'По правому краю',
    'modal.yaml-error': 'Ошибка парсинга YAML',

    // Template defaults
    'template.default-type': 'Чудесный предмет',
    'template.default-align': 'ширина',

    // Catalog View
    'catalog.title': 'Каталог карточек',
    'catalog.header': 'Каталог предметов',
    'catalog.search-placeholder': 'Поиск по названию...',
    'catalog.empty': 'Каталог пуст',
    'catalog.not-found': 'Ничего не найдено',

    // Preview View
    'preview.title': 'Превью карточки',
    'preview.back': '← Назад к каталогу',
};

const dictionaries: Record<Lang, Record<string, string>> = { en, ru };

export function setLang(lang: Lang): void {
    currentLang = lang;
}

export function getLang(): Lang {
    return currentLang;
}

export function t(key: string, params?: Record<string, string>): string {
    let str = dictionaries[currentLang][key] ?? dictionaries['en'][key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.replace(`{${k}}`, v);
        }
    }
    return str;
}
