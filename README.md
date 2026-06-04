# Wonderful Cards (Obsidian Plugin)

Wonderful Cards is an Obsidian plugin that allows you to create and display beautiful magic item cards for Dungeons & Dragons (D&D) directly within your notes.

## Features

- **Beautiful D&D Cards:** Render rich, themed cards for magic items.
- **Easy Syntax:** Use simple `itemcard` YAML code blocks in Obsidian to define your items.
- **Customizable:** Fully customizable card data including images, price, rarity, and descriptions.
- **Catalog System:** Save and manage all your magic items in a global catalog.
- **Inline References:** Quickly preview cards in any note using the `wc:Item Name` syntax or by clicking internal links.

## How to use

In any Obsidian note, create an `itemcard` code block and fill it with the item's details in YAML format. You can also use the "Вставить шаблон магического предмета" (Insert magic item template) command to quickly insert a blank card.

### Example

````markdown
```itemcard
name: "Посох Мощи"
title_en: "Staff of Power"
image: "https://example.com/staff.png"
type: "Посох"
subtype: "Магическое оружие"
rarity: "Очень редкий"
attunement: "колдуном, чародеем или волшебником"
price: "5000 зм"
text_align: "ширина"
description: |
  Этот посох можно использовать как магический боевой посох, дающий бонус +2 к броскам атаки и урона.
  
  Пока вы держите его, вы получаете бонус +2 к КД, спасброскам и броскам атаки заклинаниями.
```
````

### Supported Fields

- `name`: (Required) The name of the item.
- `title_en`: (Optional) The original English name.
- `image`: (Optional) URL or Obsidian internal link to an image (e.g., `image.png` or `https://...`).
- `type`: (Optional) Item type (default: "Чудесный предмет").
- `subtype`: (Optional) Item subtype.
- `rarity`: (Optional) Item rarity (e.g., обычный, необычный, редкий, очень редкий, легендарный, артефакт).
- `attunement`: (Optional) Boolean (`true`/`false`) or string (e.g., "требуется настройка бардом").
- `price`: (Optional) Price with currency (e.g., "500 зм", "10 см", "5 мм").
- `text_align`: (Optional) Text alignment for the description (`left`, `center`, `right`, `justify` / `ширина`).
- `description`: (Optional) Multiline Markdown description of the item.

## Installation

### From Obsidian Community Plugins (Recommended)
1. Open Settings in Obsidian.
2. Go to **Community plugins** and turn off **Safe mode**.
3. Click **Browse** and search for "Wonderful Cards".
4. Install and enable the plugin.

### Manual Installation
1. Download the latest release (`main.js`, `manifest.json`, `styles.css`) from the [Releases page](https://github.com/trikorka/wonderful-cards/releases).
2. Create a folder named `wonderful-cards` inside your `.obsidian/plugins/` directory.
3. Place the downloaded files into that folder.
4. Reload Obsidian and enable the plugin in the Settings under Community plugins.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
