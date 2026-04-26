# 🇮🇷 Iranian Useful Sites Directory

A fully responsive, single-page web directory of Iranian websites, designed for ease of use during the national internet (intranet) period. The page loads without any external CDN – all fonts, styles, and icons are self-contained.

## ✨ Features

- **Real-time search** by site name, tags, description, and even parts of the URL.
- **Tag-based filtering** with interactive chips; clicking a tag instantly filters the list.
- **Expandable cards** – click on a card (except buttons) to reveal:
  - A description of the site
  - "آدرس اصلی" (main link) and "آدرس علی" (unfiltered/alternative link) – clicking them **copies the URL to your clipboard**.
  - Social media links (global platforms like Telegram, Instagram, plus Iranian networks like Eitaa, Rubika, Soroush, Bale, Aparat).
- **Recommended sites** are marked with a star (⭐) and a highlighted border.
- A single "برو به سایت" (Go to site) button that opens the unfiltered link in a new tab.
- Fully responsive layout – works on mobile, tablet, and desktop.
- No external CDN dependencies; all assets are inline.

## 📁 Project Structure

```
awesome-iran/
├── index.html              # Main HTML page
├── css/
│   └── style.css           # All styles
├── js/
│   └── main.js             # Application logic (loads data from JSON)
├── data/
│   └── sites.json          # Sites data (editable JSON)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment workflow
└── README.md
```

## 📦 Data Structure

Each site in the directory is represented by a JSON object in `data/sites.json`:

```json
{
  "id": 1,
  "name": "نام سایت",
  "mainLink": "https://example.com",
  "unfilteredLink": "https://example.com",
  "description": "توضیحات سایت",
  "tags": ["تگ۱", "تگ۲"],
  "recommended": true,
  "social": {
    "telegram": "https://t.me/example",
    "instagram": "https://instagram.com/example"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | A unique numeric ID for the site. |
| `name` | String | Display name of the site. |
| `mainLink` | String | The primary domain/URL. Can be the same as `unfilteredLink`. |
| `unfilteredLink` | String | A link that might bypass filtering or be an alternative address. Displayed as "آدرس علی". |
| `description` | String | A short description (in Persian) explaining what the site offers. |
| `tags` | Array of Strings | Keywords that help in searching and filtering. Examples: `["دانلود", "فیلم"]`. |
| `recommended` | Boolean | If true, a star icon and a coloured border are shown on the card. |
| `social` | Object (optional) | Contains social media URLs. Keys are platform names; values are full URLs. Supported platforms: `telegram`, `instagram`, `twitter`, `youtube`, `eitaa`, `rubika`, `soroush`, `bale`, `aparat`, `whatsapp`, `linkedin`. |

## 🛠 Usage

1. Clone or download the repository.
2. Open `index.html` in any modern browser (requires a local server for JSON loading, e.g. `python3 -m http.server` or VS Code Live Server).
3. Use the search box to find sites by name, URL, or tag.
4. Click on tag chips to filter by category.
5. Click on a card (the body, not the "Go" button) to expand and see more details, then click on any link label to copy the URL.
6. Press the "برو به سایت" button to directly visit a site in a new tab.

## 📝 Adding New Sites

To add a new site, edit `data/sites.json` and insert a new object following the structure above. The site will automatically appear and be fully searchable after page refresh.

> **Note:** Since data is loaded from a JSON file via `fetch()`, you need a local HTTP server to test locally. You can use:
> ```bash
> # Python
> python3 -m http.server 8000
> 
> # Node.js
> npx serve .
> ```

## 🚀 Deployment to GitHub Pages

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on every push to the `main` branch.

### Setup Steps:
1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push your code to the `main` branch
4. The site will be automatically built and deployed

## 📱 Responsive Design

The layout adapts using CSS Grid and media queries:

- **Mobile** (< 480px): single column, compact padding.
- **Tablet & Small desktop** (≥ 700px): two columns.
- **Large screens** (≥ 1300px): three columns for efficient browsing.

## 🔒 No External Dependencies

The page is completely self-contained:

- Fonts are set to system defaults (Tahoma, Segoe UI, etc.).
- Icons are inline SVGs.
- All styles and scripts are separate files but self-contained.

## 📄 License

This project is provided for educational and community use. Feel free to adapt and share.
