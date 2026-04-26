markdown

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

## 📦 Data Structure

Each site in the directory is represented by a JavaScript object with the following properties:

```js
{
  id: Number,               // Unique identifier
  name: String,             // Site name (e.g., "دانلودها")
  mainLink: String,         // Primary URL
  unfilteredLink: String,   // Alternative/unfiltered URL (can be same as mainLink)
  description: String,      // Brief description in Persian
  tags: Array<String>,      // List of tags (e.g., ["دانلود", "فیلم"])
  recommended: Boolean,     // Whether the site is recommended
  social: {                 // Optional social media links
    telegram?: String,      // Telegram channel/group URL
    instagram?: String,
    twitter?: String,
    youtube?: String,
    eitaa?: String,         // Iranian social network
    rubika?: String,        // Iranian social network
    soroush?: String,       // Iranian social network
    bale?: String,          // Iranian social network
    aparat?: String,        // Iranian video platform
    whatsapp?: String,
    linkedin?: String
  }
}

Field Details
Field	Type	Description
id	Number	A unique numeric ID for the site.
name	String	Display name of the site.
mainLink	String	The primary domain/URL. Can be the same as unfilteredLink.
unfilteredLink	String	A link that might bypass filtering or be an alternative address. Displayed as "آدرس علی".
description	String	A short description (in Persian) explaining what the site offers.
tags	Array of Strings	Keywords that help in searching and filtering. Examples: ["دانلود", "فیلم"].
recommended	Boolean	If true, a star icon and a coloured border are shown on the card.
social	Object (optional)	Contains social media URLs. Keys are platform names; values are full URLs. Supported platforms: telegram, instagram, twitter, youtube, eitaa, rubika, soroush, bale, aparat, whatsapp, linkedin.
🛠 Usage

    Clone or download the repository.

    Open index.html in any modern browser (no server required).

    Use the search box to find sites by name, URL, or tag.

    Click on tag chips to filter by category.

    Click on a card (the body, not the "Go" button) to expand and see more details, then click on any link label to copy the URL.

    Press the "برو به سایت" button to directly visit a site in a new tab.

📝 Adding New Sites

To add a new site, edit the sitesData array inside the <script> tag and insert a new object following the structure above. The site will automatically appear and be fully searchable.
📱 Responsive Design

The layout adapts using CSS Grid and media queries:

    Mobile ( < 480px ): single column, compact padding.

    Tablet & Small desktop ( ≥ 700px ): two columns.

    Large screens ( ≥ 1300px ): three columns for efficient browsing.

🔒 No External Dependencies

The page is completely self-contained:

    Fonts are set to system defaults (Tahoma, Segoe UI, etc.).

    Icons are inline SVGs.

    All styles and scripts are embedded in the HTML file.

📄 License

This project is provided for educational and community use. Feel free to adapt and share.
