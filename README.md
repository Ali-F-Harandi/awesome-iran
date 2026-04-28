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
- **Smooth animations** – cards fade in with staggered delay, hover effects with lift, and transitions throughout.
- **Responsive grid** using `auto-fit` / `minmax` for fluid column layout without complex media queries.
- **Accessibility** – focus-visible outlines on all interactive elements, touch-friendly 44px targets, semantic HTML.
- **Footer** with last-updated date from `meta.json`.
- No external CDN dependencies; all assets are bundled locally.
- **Standalone site editor** (`site-editor.html`) for managing `sites.json` and `meta.json` without editing code directly.
- **Offline version** (`offline.html`) — a single-file, zero-dependency version that works without a server, perfect for sharing via USB or email during the national internet period.

## 📁 Project Structure

```
awesome-iran/
├── index.html              # Main site page
├── offline.html            # Lightweight single-file offline version (no external deps)
├── site-editor.html        # Standalone JSON editor for managing sites
├── css/
│   └── style.css           # All styles (emerald green theme + dark mode)
├── js/
│   └── main.js             # Site logic (search, filter, render, hash, back-to-top)
├── data/
│   ├── sites.json          # Site data (array of site objects)
│   └── meta.json           # Project metadata (lastUpdated date)
├── fonts/
│   ├── vazirmatn/          # Vazirmatn Persian font (woff2)
│   │   ├── Vazirmatn[wght].woff2  # Variable font
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
│       └── deploy.yml      # GitHub Pages auto-deploy
└── README.md
```

## 📦 Data Structure

Each site in the directory is represented by a JSON object in `data/sites.json`:

```json
{
  "id": 21,
  "name": "مووی‌یاب",
  "mainLink": "https://movieyaab.ir",
  "unfilteredLink": "https://movieyaab.ir",
  "description": "پلتفرم جستجوی فیلم، سریال و انیمه.",
  "tags": ["فیلم و سریال", "انیمه", "جستجو", "پخش آنلاین", "دانلود"],
  "recommended": true,
  "social": {
    "telegram_bot": "https://t.me/example_bot",
    "telegram": "https://t.me/example",
    "instagram": "https://instagram.com/example",
    "rubika": "https://rubika.ir/example",
    "bale": "https://ble.ir/example"
  },
  "donate": "https://example.com/donate",
  "customLinks": [
    { "title": "وبلاگ", "url": "https://blog.example.com", "icon": "blog" },
    { "title": "آرشیو", "url": "https://archive.example.com", "icon": "archive" }
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
| `tags` | Array of Strings | ✅ | Keywords for search and filtering. The **first tag** is the site's **main category** (displayed in red). Example: `["فیلم و سریال", "دانلود", "زیرنویس"]`. |
| `recommended` | Boolean | ✅ | If `true`, a gold "★ پیشنهادی" badge and a highlighted border are shown. |
| `social` | Object | — | Social media links. Keys are platform names, values are full URLs. |
| `donate` | String or `null` | — | A donation/support URL. If present, a "حمایت مالی ❤" button appears. Use `null` to omit. |
| `customLinks` | Array of Objects | — | Additional custom links. Each item has `title`, `url`, and `icon` fields. |

### Supported Social Platforms

| Key | Label | Icon |
|-----|-------|------|
| `telegram` | تلگرام | Telegram |
| `telegram_bot` | ربات تلگرام | Robot |
| `instagram` | اینستاگرام | Instagram |
| `twitter` | توییتر | X (Twitter) |
| `youtube` | یوتیوب | YouTube |
| `eitaa` | ایتا | Paper Plane |
| `rubika` | روبیکا | Chat Dots |
| `soroush` | سروش | Feather |
| `bale` | بله | Dove |
| `aparat` | آپارات | Video |
| `whatsapp` | واتساپ | WhatsApp |
| `linkedin` | لینکدین | LinkedIn |
| `discord` | دیسکورد | Discord |

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

1. Clone or download the repository.
2. Open `index.html` in any modern browser (requires a local server for JSON loading, e.g. `python3 -m http.server` or VS Code Live Server).
3. Use the search box to find sites by name, URL, or tag.
4. Click on tag chips to filter by category.
5. Click on a card to expand and see more details, then click on any link label to copy the URL.
6. Press the "برو به سایت" button to directly visit a site in a new tab.

### To Edit Sites:
1. Open `site-editor.html` in a browser.
2. Import your `sites.json` file.
3. Edit, add, remove, or reorder sites.
4. Download or copy the updated JSON.
5. Replace `data/sites.json` with the new content.

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

## 🎨 Design

- **Emerald green** accent color (#10b981) with warm background gradient.
- **Vazirmatn** Persian font for excellent readability.
- **Dark mode** with system preference detection and manual toggle.
- **Focus-visible** outlines for keyboard accessibility.
- **44px minimum** touch targets for mobile-friendly interaction.
- **Smooth animations** — staggered card entrance, hover lift effects, tag transitions.

## 🔒 No External Dependencies

The page is completely self-contained:

- **Vazirmatn** Persian font is bundled locally (woff2) in `fonts/vazirmatn/`.
- **Font Awesome 6** icons are bundled locally in `fonts/fontawesome/` — no CDN required.
- All styles and scripts are separate files but self-contained.

## 📦 Download

A pre-built ZIP archive of the entire project is included as `awesome-iran.zip` in the root directory. Download and extract it to get the complete project with all fonts, icons, and assets.

## 📄 License

This project is provided for educational and community use. Feel free to adapt and share.
