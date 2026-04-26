# 🇮🇷 Iranian Useful Sites Directory

A fully responsive, single-page web directory of Iranian websites, designed for ease of use during the national internet (intranet) period.

## ✨ Features

- **Real-time search** by site name, tags, description, and URL
- **Tag-based filtering** with interactive chips
- **Expandable cards** with description, copy-to-clipboard links, and social media badges
- **FontAwesome icons** and **Vazirmatn Persian font** — all bundled locally (no CDN)
- Fully responsive layout (1/2/3 columns)

## 📁 Project Structure

```
awesome-iran/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── data/
│   └── sites.json
├── fonts/
│   ├── vazirmatn/          # Persian font (local)
│   │   ├── Vazirmatn-Regular.woff2
│   │   ├── Vazirmatn-Bold.woff2
│   │   ├── Vazirmatn-Medium.woff2
│   │   ├── Vazirmatn-SemiBold.woff2
│   │   └── Vazirmatn-Black.woff2
│   └── fontawesome/        # FA 6 icons (local)
│       ├── css/all.min.css
│       └── webfonts/
├── .github/workflows/
│   └── deploy.yml
└── README.md
```

## 📦 Sample Data Record

```json
{
  "id": 1,
  "name": "دانلودها",
  "mainLink": "https://downloadha.com",
  "unfilteredLink": "https://downloadha.com",
  "description": "مرجع دانلود فیلم، سریال، نرم‌افزار، بازی و موسیقی با لینک مستقیم. یکی از قدیمی‌ترین و معتبرترین سایت‌های دانلود ایرانی.",
  "tags": ["دانلود", "فیلم", "سریال", "نرم‌افزار", "بازی", "موسیقی"],
  "recommended": true,
  "social": {
    "telegram": "https://t.me/downloadha",
    "instagram": "https://instagram.com/downloadha_ir",
    "eitaa": "https://eitaa.com/downloadha",
    "aparat": "https://aparat.com/downloadha",
    "rubika": "https://rubika.ir/downloadha"
  }
}
```

## 🛠 Usage

1. Clone or download the repository
2. Start a local HTTP server (required for JSON fetch):
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser

## 📝 Adding New Sites

Edit `data/sites.json` and add a new object following the sample structure above.

## 🚀 GitHub Pages

The included `.github/workflows/deploy.yml` automatically deploys to GitHub Pages on every push to `main`.

## 🔒 No External Dependencies

All assets (Vazirmatn font, FontAwesome icons) are bundled locally — no CDN required.
