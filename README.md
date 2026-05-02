# 🇮🇷 Iranian Useful Sites Directory

A fully responsive, single-page web directory of Iranian websites, designed for ease of use during the national internet (intranet) period. The page loads without any external CDN – all fonts, styles, and icons are self-contained.

## ✨ Features

- **Real-time search** by site name, tags, description, and even parts of the URL.
- **Tag-based filtering** with interactive pill-shaped chips; clicking a tag instantly filters the list.
- **First tag = main category** — the first tag of each site is displayed in red as its primary category.
- **Grouped display** — sites are grouped by their main category (first tag), sorted by **frequency** (most common category first). Within each group, recommended sites appear first, then by ID.
- **Smart filter sorting** — when a tag filter is active, sites are sorted: recommended first → main tag matches filter → by ID. This ensures the most relevant results appear at the top.
- **Results count** shows "نمایش X از Y سایت" (with normal digits) to always know how many sites are visible.
- **URL hash persistence** – filter state is saved in the URL (e.g. `#search=film&tag=دانلود`) so you can share filtered views.
- **Dark mode** with system preference detection and localStorage persistence.
- **Back-to-top button** appears after scrolling, for easy navigation on mobile.
- **Expandable cards** – click on a card (except buttons) to reveal:
  - A description of the site
  - "آدرس اصلی" (main link) and "آدرس فعلی" (unfiltered/alternative link) – clicking them **copies the URL to your clipboard**.
  - Social media and related links (global platforms like Telegram, Instagram, Discord, plus Iranian networks like Eitaa, Rubika, Soroush, Bale, Aparat).
  - Custom links (blog, archive, support, etc.).
  - Donate/support link (if available).
- **Bookmarks** – save your favorite sites locally; they persist across sessions and can be filtered with the bookmark button.
- **View toggle** – switch between card grid view and compact list view.
- **Expand/Collapse All** – open or close all visible cards with a single click.
- **Multiple sort options**:
  - 📦 Default (category grouping by frequency)
  - 🔤 Name (alphabetical)
  - ⭐ Recommended first
  - 🔢 ID (numeric order)
- **Site availability checker** – quickly test if sites are accessible with the "بررسی سایت‌ها" button.
- **Smooth animations** – cards fade in with staggered delay, hover effects with lift, and transitions throughout.
- **Responsive grid** using `auto-fit` / `minmax` for fluid column layout without complex media queries.
- **Accessibility** – focus-visible outlines on all interactive elements, touch-friendly 44px targets, semantic HTML.
- **Footer** with last-updated date from `meta.json` and configurable footer links.
- No external CDN dependencies; all assets are bundled locally.
- **Standalone site editor** (`site-editor.html`) for managing `sites.json` and `meta.json` without editing code directly.
- **Offline version** (`offline.html`) — a single-file, zero-dependency version that works without a server, perfect for sharing via USB or email during the national internet period.

## 📁 Project Structure

```
awesome-iran/
├── index.html              # Main site page (multi-file, requires server for JSON)
├── offline.html            # Lightweight single-file offline version (no external deps, works from file://)
├── site-editor.html        # Standalone JSON editor for managing sites and metadata
├── css/
│   └── style.css           # All styles (emerald green theme + dark mode, 1200+ lines)
├── js/
│   └── main.js             # Site logic (search, filter, render, hash, bookmarks, sort, view toggle, availability check)
├── data/
│   ├── sites.json          # Site data (array of site objects with tags as IDs)
│   ├── tags.json           # Tag definitions (id, name, emoji icon, Font Awesome icon)
│   ├── socials.json        # Social platform definitions (key, label, icon, Font Awesome class)
│   └── meta.json           # Project metadata (lastUpdated date, footerLinks array)
├── fonts/
│   ├── vazirmatn/          # Vazirmatn Persian font (woff2)
│   │   ├── Vazirmatn[wght].woff2  # Variable font (weights 100-900)
│   │   ├── Vazirmatn-Regular.woff2
│   │   ├── Vazirmatn-Bold.woff2
│   │   ├── Vazirmatn-Medium.woff2
│   │   ├── Vazirmatn-SemiBold.woff2
│   │   └── Vazirmatn-Black.woff2
│   └── fontawesome/        # Font Awesome 6 icons
│       ├── css/
│       │   └── all.min.css
│       └── webfonts/
│           ├── fa-solid-900.woff2
│           ├── fa-regular-400.woff2
│           ├── fa-brands-400.woff2
│           └── ...
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages auto-deploy on push to main
└── README.md
```

## 📦 Data Structure

### Sites (`data/sites.json`)

Each site in the directory is represented by a JSON object in `data/sites.json`:

```json
{
  "id": 21,
  "name": "مووی‌یاب",
  "mainLink": "https://movieyaab.ir",
  "unfilteredLink": "https://movieyaab.ir",
  "description": "پلتفرم جستجوی فیلم، سریال و انیمه.",
  "tags": [9, 35, 39, 7, 1],
  "recommended": true,
  "social": {
    "telegram_bot": "https://t.me/example_bot",
    "telegram": "https://t.me/example",
    "instagram": "https://instagram.com/example",
    "rubika": "https://rubika.ir/example",
    "bale": "https://ble.ir/example"
  },
  "donate": null,
  "customLinks": [
    { "title": "وبلاگ", "url": "https://blog.example.com", "icon": "blog" },
    { "title": "آرشیو", "url": "https://archive.example.com", "icon": "archive" }
  ]
}
```

> **Note:** Tags are now stored as numeric IDs (referencing `tags.json`) instead of string names. This allows for dynamic tag management and multi-language support.

### Tags (`data/tags.json`)

Tags are defined in a separate file with ID, name, emoji icon, and Font Awesome icon:

```json
[
  {
    "id": 1,
    "name": "دانلود",
    "icon": "📥",
    "iconFA": "fa-solid fa-download"
  },
  {
    "id": 9,
    "name": "فیلم و سریال",
    "icon": "🎬",
    "iconFA": "fa-solid fa-film"
  },
  {
    "id": 35,
    "name": "انیمه",
    "icon": "🎌",
    "iconFA": "fa-solid fa-dragon"
  }
]
```

### Social Platforms (`data/socials.json`)

Social platform definitions with key, label, emoji icon, Font Awesome class, and CSS class:

```json
[
  {
    "id": 1,
    "key": "telegram",
    "label": "تلگرام",
    "icon": "✈️",
    "iconFA": "fa-brands fa-telegram",
    "cls": "social-telegram"
  },
  {
    "id": 6,
    "key": "eitaa",
    "label": "ایتا",
    "icon": "📨",
    "iconFA": "fa-solid fa-paper-plane",
    "cls": "social-eitaa"
  }
]
```

### Metadata (`data/meta.json`)

Project metadata including last updated date and optional footer links:

```json
{
  "lastUpdated": "۱۴۰۳/۰۸/۱۵",
  "footerLinks": [
    {
      "label": "گیت‌هاب",
      "url": "https://github.com/your-repo",
      "icon": "🐙",
      "iconFA": "fa-brands fa-github"
    }
  ]
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Number | ✅ | A unique numeric ID for the site. |
| `name` | String | ✅ | Display name of the site (Persian or English). |
| `mainLink` | String | ✅ | The primary domain/URL of the site. |
| `unfilteredLink` | String | ✅ | An alternative or bypass link. Displayed as "آدرس فعلی" in the card. |
| `description` | String | ✅ | A short description explaining what the site offers. |
| `tags` | Array of Numbers | ✅ | Tag **IDs** referencing `tags.json`. The **first tag** is the site's **main category** (displayed in red). Example: `[9, 35, 39, 7, 1]` where 9 = "فیلم و سریال". |
| `recommended` | Boolean | ✅ | If `true`, a gold "★ پیشنهادی" badge and a highlighted border are shown. |
| `social` | Object | — | Social media links. Keys are platform names (matching `socials.json` keys), values are full URLs. |
| `donate` | String or `null` | — | A donation/support URL. If present, a "حمایت مالی ❤" button appears. Use `null` to omit. |
| `customLinks` | Array of Objects | — | Additional custom links. Each item has `title`, `url`, and `icon` fields. |

### Supported Social Platforms

These keys can be used in the `social` object (matching keys in `socials.json`):

| Key | Label | Font Awesome Icon |
|-----|-------|-------------------|
| `telegram` | تلگرام | `fa-brands fa-telegram` |
| `telegram_bot` | ربات تلگرام | `fa-solid fa-robot` |
| `instagram` | اینستاگرام | `fa-brands fa-instagram` |
| `twitter` | توییتر | `fa-brands fa-x-twitter` |
| `youtube` | یوتیوب | `fa-brands fa-youtube` |
| `eitaa` | ایتا | `fa-solid fa-paper-plane` |
| `rubika` | روبیکا | `fa-solid fa-comment-dots` |
| `soroush` | سروش | `fa-solid fa-feather` |
| `bale` | بله | `fa-solid fa-dove` |
| `aparat` | آپارات | `fa-solid fa-video` |
| `whatsapp` | واتساپ | `fa-brands fa-whatsapp` |
| `linkedin` | لینکدین | `fa-brands fa-linkedin` |
| `discord` | دیسکورد | `fa-brands fa-discord` |
| `github` | گیت‌هاب | `fa-brands fa-github` |

> New platforms can be added by editing `data/socials.json`.

### Supported Custom Link Icons

| Icon Value | Display Icon |
|------------|-------------|
| `link` | 🔗 Link (default) |
| `blog` | 📝 Blog |
| `website` | 🌐 Website |
| `download` | ⬇️ Download |
| `archive` | 📦 Archive |
| `support` | 🎧 Support |
| `contact` | ✉️ Contact |
| `app` | 📱 App |
| `heart` | ❤️ Heart |

## 📴 Offline Version (`offline.html`)

A **lightweight, single-file** version of the site directory that works completely offline with **zero external dependencies**:

- **Single HTML file** — all CSS, JavaScript, and data are inlined
- **No font files** — uses system fonts (Tahoma, Segoe UI) instead of Vazirmatn
- **No Font Awesome** — icons are replaced with emoji/Unicode characters
- **No server required** — works when opened directly from the file system (`file://` protocol)
- **All data inlined** — `sites.json` and `meta.json` are embedded as JavaScript variables
- **Full functionality** — search, tag filtering, dark mode, bookmarks, sort, view toggle, expand/collapse all, copy-to-clipboard (with `file://` fallback), URL hash persistence, and back-to-top button

### When to Use `offline.html` vs `index.html`

| Feature | `index.html` | `offline.html` |
|---------|-------------|----------------|
| Requires a web server | ✅ Yes | ❌ No |
| Vazirmatn Persian font | ✅ Beautiful | ❌ System fonts |
| Font Awesome icons | ✅ Professional | ❌ Emoji icons |
| Single file | ❌ Multi-file | ✅ Single file |
| File size | ~2 MB (with fonts) | ~86 KB |
| Best for | Production / GitHub Pages | Offline sharing / USB / Email |

> To update the offline version with new data, edit the `SITES_DATA` and `META_DATA` variables inside `offline.html`.

## 🛠 Site Editor (`site-editor.html`)

A standalone HTML file for visually editing site data without touching code:

- **Import** existing `sites.json` and `meta.json` files
- **Add / Delete / Duplicate** sites
- **Edit** all fields inline (name, links, description, tags, social, donate, custom links)
- **Drag & drop** to reorder sites
- **Meta.json editor** with Gregorian → Jalali date auto-conversion
- **Search** through the list
- **Export** updated JSON — copy to clipboard or download

> The editor works completely standalone — just open it in a browser (no server needed).

## 🚀 Usage

### Running the Main Site (`index.html`)

1. Clone or download the repository.
2. Open `index.html` in any modern browser (**requires a local server** for JSON loading):
   - Python: `python3 -m http.server 8000` then visit `http://localhost:8000`
   - Node.js: `npx serve` or `npx http-server`
   - VS Code: Use the "Live Server" extension
3. Use the search box to find sites by name, URL, or tag.
4. Click on tag chips to filter by category.
5. Click on a card to expand and see more details, then click on any link label to copy the URL.
6. Press the "برو به سایت" button to directly visit a site in a new tab.

### Using the Offline Version (`offline.html`)

1. Simply open `offline.html` directly in any browser (no server needed).
2. Works from `file://` protocol — perfect for USB drives or email attachments.
3. To update data, edit the `SITES_DATA` and `META_DATA` JavaScript variables inside the file.

### Editing Sites with the Editor

1. Open `site-editor.html` in a browser (no server needed).
2. Import your `sites.json` and `meta.json` files.
3. Edit, add, remove, duplicate, or reorder sites using drag & drop.
4. Edit all fields inline including tags (with autocomplete), social links, donate URL, and custom links.
5. Export updated JSON — copy to clipboard or download as files.
6. Replace `data/sites.json` and `data/meta.json` with the new content.

## 🚀 Deployment to GitHub Pages

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on every push to the `main` branch.

### Setup Steps:
1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push your code to the `main` branch
4. The site will be automatically built and deployed

## 📱 Responsive Design

The layout uses CSS Grid with `auto-fit` / `minmax(300px, 1fr)`:

- Automatically adjusts from 1 to 3 columns based on available width.
- Mobile (< 480px): single column, compact padding.
- Tablet & desktop: fluid multi-column layout.
- List view mode: compact single-column layout for quick scanning.

## 🎨 Design

- **Emerald green** accent color (#10b981) with warm background gradient.
- **Vazirmatn** Persian font (variable weight woff2) for excellent readability.
- **Dark mode** with system preference detection and manual toggle (persisted in localStorage).
- **Focus-visible** outlines for keyboard accessibility.
- **44px minimum** touch targets for mobile-friendly interaction.
- **Smooth animations** — staggered card entrance, hover lift effects, tag transitions.
- **Category headers** with Font Awesome icons and frequency counts.

## 🔒 No External Dependencies

The page is completely self-contained:

- **Vazirmatn** Persian font is bundled locally (woff2 variable font, weights 100-900) in `fonts/vazirmatn/`.
- **Font Awesome 6** icons are bundled locally in `fonts/fontawesome/` — no CDN required.
- All styles (1200+ lines) and scripts (1000+ lines) are separate files but self-contained.
- Data is loaded from local JSON files (`sites.json`, `tags.json`, `socials.json`, `meta.json`).

## 📦 Download

A pre-built ZIP archive of the entire project is included as `awesome-iran.zip` in the root directory. Download and extract it to get the complete project with all fonts, icons, and assets.

## 📄 License

This project is provided for educational and community use. Feel free to adapt and share.
