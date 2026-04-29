// ═══════════════════════════════════════════════════════════════════
// main.js — سایت‌های ایرانی | Production-Ready Refactored
// ═══════════════════════════════════════════════════════════════════

'use strict';

// ───────────────────────────────────────────────────────────────────
// Configuration & Constants
// ───────────────────────────────────────────────────────────────────
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'theme',
        BOOKMARKS: 'awesome-iran-bookmarks'
    },
    DATA_FILES: {
        SITES: 'data/sites.json',
        META: 'data/meta.json'
    },
    ANIMATION: {
        CARD_DELAY_MS: 40,
        CARD_DELAY_MAX_MS: 1200,
        COPY_SUCCESS_MS: 1800,
        ENTRANCE_DELAY_MS: 50
    },
    DEBOUNCE: {
        SEARCH_MS: 200,
        HASH_MS: 150
    },
    SCROLL: {
        BACK_TO_TOP_PX: 300
    }
};

const SOCIAL_PLATFORMS = {
    telegram_bot: { label: 'ربات تلگرام', cls: 'social-telegram', icon: 'fa-solid fa-robot' },
    telegram: { label: 'تلگرام', cls: 'social-telegram', icon: 'fa-brands fa-telegram' },
    instagram: { label: 'اینستاگرام', cls: 'social-instagram', icon: 'fa-brands fa-instagram' },
    twitter: { label: 'توییتر', cls: 'social-twitter', icon: 'fa-brands fa-x-twitter' },
    youtube: { label: 'یوتیوب', cls: 'social-youtube', icon: 'fa-brands fa-youtube' },
    eitaa: { label: 'ایتا', cls: 'social-eitaa', icon: 'fa-solid fa-paper-plane' },
    rubika: { label: 'روبیکا', cls: 'social-rubika', icon: 'fa-solid fa-comment-dots' },
    soroush: { label: 'سروش', cls: 'social-soroush', icon: 'fa-solid fa-feather' },
    bale: { label: 'بله', cls: 'social-bale', icon: 'fa-solid fa-dove' },
    aparat: { label: 'آپارات', cls: 'social-aparat', icon: 'fa-solid fa-video' },
    whatsapp: { label: 'واتساپ', cls: 'social-whatsapp', icon: 'fa-brands fa-whatsapp' },
    linkedin: { label: 'لینکدین', cls: 'social-linkedin', icon: 'fa-brands fa-linkedin' },
    discord: { label: 'دیسکورد', cls: 'social-discord', icon: 'fa-brands fa-discord' }
};

const CUSTOM_LINK_ICONS = {
    blog: 'fa-solid fa-blog',
    link: 'fa-solid fa-arrow-up-right-from-square',
    website: 'fa-solid fa-globe',
    download: 'fa-solid fa-download',
    archive: 'fa-solid fa-box-archive',
    support: 'fa-solid fa-headset',
    contact: 'fa-solid fa-envelope',
    app: 'fa-solid fa-mobile-screen-button',
    heart: 'fa-solid fa-heart'
};

const CATEGORY_ICONS = {
    'دانلود': '📥', 'فیلم و سریال': '🎬', 'استریم': '▶️', 'سرگرمی': '🎭',
    'خرید': '🛒', 'فروشگاه': '🏪', 'وبلاگ': '📝', 'وبلاگدهی': '📝',
    'آموزش': '🎓', 'برنامه‌نویسی': '💻', 'تکنولوژی': '💻', 'ویدیو': '🎥',
    'اشتراک‌گذاری': '🔗', 'پخش زنده': '📡', 'کتاب': '📚', 'کتابخوان': '📖',
    'آگهی': '📢', 'نقشه': '🗺️', 'مسیریاب': '🧭', 'جستجوگر': '🔍',
    'فراجستجوگر': '🔍', 'هوش مصنوعی': '🤖', 'بازی': '🎮', 'فارسی ساز': '🌍',
    'اپلیکیشن': '📱', 'اندروید': '📱', 'محصولات': '📦', 'اقتصادی': '💰',
    'مقایسه قیمت': '📊', 'نویسندگی': '✍️', 'محتوا': '📰', 'مطالعه': '📖',
    'ساخت وبلاگ': '✏️', 'جامعه': '👥', 'دوره آنلاین': '🎓', 'بدون سانسور': '🔓',
    'زیرنویس': '💬', 'دوبله': '🎙️', 'رایگان': '🎁', 'انیمه': '🎌',
    'پخش آنلاین': '▶️', 'متا سرچ': '🔎', 'دستیار هوشمند': '🤖',
    'تولید تصویر': '🎨', 'حریم شخصی': '🔒', 'وبگرد': '🌐', 'کامپیوتر': '🖥️',
    'کنسول': '🎮', 'صنایع دستی': '🎨', 'هنر': '🎨', 'ناوبری': '🧭'
};

const DEFAULT_ICON = '📌';

// ───────────────────────────────────────────────────────────────────
// Application State
// ───────────────────────────────────────────────────────────────────
const state = {
    sites: [],
    activeTags: new Set(),
    searchQuery: '',
    expandedCardIds: new Set(),
    sortMode: 'default',
    viewMode: 'card',
    showBookmarksOnly: false,
    bookmarkedIds: new Set(),
    allExpanded: false,
    timers: {
        hash: null,
        debounce: null
    }
};

// ───────────────────────────────────────────────────────────────────
// DOM Elements Cache
// ───────────────────────────────────────────────────────────────────
let elements = {};

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Get category icon with fallback
 */
function getCategoryIcon(tag) {
    return CATEGORY_ICONS[tag] || DEFAULT_ICON;
}

// ═══════════════════════════════════════════════════════════════════
// THEME MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

(function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Determine initial theme: saved > system > light
    let theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, next);
    });
})();

// ═══════════════════════════════════════════════════════════════════
// BOOKMARK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function loadBookmarks() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKMARKS);
        state.bookmarkedIds = data ? new Set(JSON.parse(data)) : new Set();
    } catch {
        state.bookmarkedIds = new Set();
    }
}

function saveBookmarks() {
    try {
        localStorage.setItem(
            CONFIG.STORAGE_KEYS.BOOKMARKS,
            JSON.stringify([...state.bookmarkedIds])
        );
    } catch {
        // Silently fail on storage errors
    }
}

function toggleBookmark(siteId) {
    if (state.bookmarkedIds.has(siteId)) {
        state.bookmarkedIds.delete(siteId);
    } else {
        state.bookmarkedIds.add(siteId);
    }
    saveBookmarks();
    updateBookmarkButton(siteId);
    updateBookmarkFilterBtn();
}

function updateBookmarkButton(siteId) {
    const btn = elements.sitesGrid?.querySelector(`[data-id="${siteId}"] .bookmark-btn`);
    if (!btn) return;

    const isBookmarked = state.bookmarkedIds.has(siteId);
    btn.classList.toggle('bookmarked', isBookmarked);
    btn.innerHTML = isBookmarked
        ? '<i class="fa-solid fa-bookmark"></i>'
        : '<i class="fa-regular fa-bookmark"></i>';
    btn.title = isBookmarked ? 'حذف از بوکمارک' : 'افزودن به بوکمارک';
}

function updateBookmarkFilterBtn() {
    elements.bookmarkFilterBtn?.classList.toggle('active', state.showBookmarksOnly);
}

    // ──────────────────────────────────
    // Category Icon Map
    // ──────────────────────────────────
    function getCategoryIcon(tag) {
        const iconMap = {
            'دانلود': '📥',
            'فیلم و سریال': '🎬',
            'استریم': '▶️',
            'سرگرمی': '🎭',
            'خرید': '🛒',
            'فروشگاه': '🏪',
            'وبلاگ': '📝',
            'وبلاگدهی': '📝',
            'آموزش': '🎓',
            'برنامه‌نویسی': '💻',
            'تکنولوژی': '💻',
            'ویدیو': '🎥',
            'اشتراک‌گذاری': '🔗',
            'پخش زنده': '📡',
            'کتاب': '📚',
            'کتابخوان': '📖',
            'آگهی': '📢',
            'نقشه': '🗺️',
            'مسیریاب': '🧭',
            'جستجوگر': '🔍',
            'فراجستجوگر': '🔍',
            'هوش مصنوعی': '🤖',
            'بازی': '🎮',
            'فارسی ساز': '🌍',
            'اپلیکیشن': '📱',
            'اندروید': '📱',
            'محصولات': '📦',
            'اقتصادی': '💰',
            'مقایسه قیمت': '📊',
            'نویسندگی': '✍️',
            'محتوا': '📰',
            'مطالعه': '📖',
            'ساخت وبلاگ': '✏️',
            'جامعه': '👥',
            'دوره آنلاین': '🎓',
            'بدون سانسور': '🔓',
            'زیرنویس': '💬',
            'دوبله': '🎙️',
            'رایگان': '🎁',
            'انیمه': '🎌',
            'پخش آنلاین': '▶️',
            'متا سرچ': '🔎',
            'دستیار هوشمند': '🤖',
            'تولید تصویر': '🎨',
            'حریم شخصی': '🔒',
            'وبگرد': '🌐',
            'کامپیوتر': '🖥️',
            'کنسول': '🎮',
            'صنایع دستی': '🎨',
            'هنر': '🎨',
            'ناوبری': '🧭',
        };
        return iconMap[tag] || '📌';
    }

    // ──────────────────────────────────
    // Load Data from JSON
    // ──────────────────────────────────
    async function loadSitesData() {
        try {
            const response = await fetch('data/sites.json');
            if (!response.ok) {
                throw new Error('خطا در بارگذاری داده‌ها');
            }
            sitesData = await response.json();
            // Load meta.json for last updated date
            loadMetaData();
            init();
        } catch (error) {
            console.error('خطا در بارگذاری sites.json:', error);
            resultsCount.innerHTML = '<strong style="color:#ef4444;">خطا در بارگذاری داده‌ها</strong>';
        }
    }

    async function loadMetaData() {
        try {
            const res = await fetch('data/meta.json');
            if (!res.ok) return;
            const meta = await res.json();
            if (meta.lastUpdated && footerDateEl) {
                footerDateEl.textContent = meta.lastUpdated;
                footerDateEl.closest('.footer-date-wrap').style.display = '';
            }
        } catch (e) {
            // Silently ignore meta.json errors
        }
    }

    // ──────────────────────────────────
    // Build All Unique Tags (sorted by frequency)
    // ──────────────────────────────────
    function getAllTags() {
        const tagCounts = {};
        sitesData.forEach(site => {
            site.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        // Sort by frequency (descending), then alphabetically (Persian)
        return Object.entries(tagCounts)
            .sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1];
                return a[0].localeCompare(b[0], 'fa');
            })
            .map(([tag, count]) => ({ tag, count }));
    }

    // ──────────────────────────────────
    // Render Tag Chips
    // ──────────────────────────────────
    function renderTagChips() {
        const allTags = getAllTags();
        tagsContainer.innerHTML = allTags.map(({ tag, count }) => {
            const isActive = activeTags.has(tag);
            return `
                    <span class="tag-chip${isActive ? ' active' : ''}"
                          data-tag="${escapeHtml(tag)}"
                          role="button"
                          tabindex="0"
                          aria-pressed="${isActive}">
                        ${escapeHtml(tag)}
                        <span class="tag-count">${count}</span>
                    </span>
                `;
        }).join('');

        // Show/hide reset button
        if (activeTags.size > 0) {
            resetTagsBtn.classList.add('visible');
        } else {
            resetTagsBtn.classList.remove('visible');
        }

        // Attach click handlers
        tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.getAttribute('data-tag');
                toggleTag(tag);
            });
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function toggleTag(tag) {
        if (activeTags.has(tag)) {
            activeTags.delete(tag);
        } else {
            activeTags.add(tag);
        }
        renderTagChips();
        filterAndRender();
        // Scroll to top of results smoothly
        sitesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetAllTags() {
        activeTags.clear();
        renderTagChips();
        filterAndRender();
    }

    // ──────────────────────────────────
    // URL Hash Persistence
    // ──────────────────────────────────
    function readHash() {
        const hash = window.location.hash.slice(1);
        if (!hash) return false;
        const params = new URLSearchParams(hash);
        const search = params.get('search');
        if (search !== null && search !== '') {
            searchQuery = decodeURIComponent(search);
            searchInput.value = searchQuery;
            clearSearchBtn.classList.add('visible');
        }
        const tags = params.getAll('tag');
        if (tags.length > 0) {
            tags.forEach(t => activeTags.add(decodeURIComponent(t)));
        }
        const sort = params.get('sort');
        if (sort && ['default', 'name', 'recommended', 'id'].includes(sort)) {
            sortMode = sort;
            sortSelect.value = sort;
        }
        const view = params.get('view');
        if (view && ['card', 'list'].includes(view)) {
            viewMode = view;
            updateViewToggleUI();
        }
        return (search !== null && search !== '') || tags.length > 0;
    }

    function writeHash() {
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
            params.set('search', searchQuery.trim());
        }
        activeTags.forEach(tag => {
            params.append('tag', tag);
        });
        if (sortMode !== 'default') {
            params.set('sort', sortMode);
        }
        if (viewMode !== 'card') {
            params.set('view', viewMode);
        }
        const hashStr = params.toString();
        const newHash = hashStr ? '#' + hashStr : '';
        if (window.location.hash !== newHash) {
            history.replaceState(null, '', location.pathname + newHash);
        }
    }

    function scheduleHashUpdate() {
        clearTimeout(hashUpdateTimer);
        hashUpdateTimer = setTimeout(writeHash, 150);
    }

    // ──────────────────────────────────
    // Sort Logic
    // ──────────────────────────────────
    function applySorting(sites) {
        if (sortMode === 'name') {
            sites.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
        } else if (sortMode === 'recommended') {
            sites.sort((a, b) => {
                if (a.recommended && !b.recommended) return -1;
                if (!a.recommended && b.recommended) return 1;
                return a.name.localeCompare(b.name, 'fa');
            });
        } else if (sortMode === 'id') {
            sites.sort((a, b) => a.id - b.id);
        } else {
            // default: group by first tag (frequency order), recommended within groups
            const tagFreq = {};
            sitesData.forEach(site => {
                const mainTag = (site.tags && site.tags.length > 0) ? site.tags[0] : '';
                if (mainTag) tagFreq[mainTag] = (tagFreq[mainTag] || 0) + 1;
            });
            const sortedTags = Object.entries(tagFreq)
                .sort((a, b) => {
                    if (b[1] !== a[1]) return b[1] - a[1];
                    return a[0].localeCompare(b[0], 'fa');
                })
                .map(([tag]) => tag);
            const tagOrder = {};
            sortedTags.forEach((tag, idx) => tagOrder[tag] = idx);

            sites.sort((a, b) => {
                const tagA = (a.tags && a.tags.length > 0) ? a.tags[0] : '';
                const tagB = (b.tags && b.tags.length > 0) ? b.tags[0] : '';
                const orderA = tagOrder[tagA] !== undefined ? tagOrder[tagA] : 9999;
                const orderB = tagOrder[tagB] !== undefined ? tagOrder[tagB] : 9999;
                if (orderA !== orderB) return orderA - orderB;
                if (a.recommended && !b.recommended) return -1;
                if (!a.recommended && b.recommended) return 1;
                return a.id - b.id;
            });
        }
        return sites;
    }

    // ──────────────────────────────────
    // Filter Logic (NOW INCLUDES URL SEARCH)
    // ──────────────────────────────────
    function getFilteredSites() {
        const query = searchQuery.trim().toLowerCase();
        let filtered = sitesData.filter(site => {
            // Search by name, tags, description, AND URLs
            const matchesSearch =
                !query ||
                site.name.toLowerCase().includes(query) ||
                site.tags.some(tag => tag.toLowerCase().includes(query)) ||
                (site.description && site.description.toLowerCase().includes(query)) ||
                site.mainLink.toLowerCase().includes(query) ||
                site.unfilteredLink.toLowerCase().includes(query);

            // Filter by active tags (OR logic)
            const matchesTags =
                activeTags.size === 0 ||
                site.tags.some(tag => activeTags.has(tag));

            // Filter by bookmarks
            const matchesBookmarks = !showBookmarksOnly || bookmarkedIds.has(site.id);

            return matchesSearch && matchesTags && matchesBookmarks;
        });

        // Apply sorting
        if (sortMode === 'default' && activeTags.size > 0) {
            // FILTER MODE with default sort: recommended first → main tag match → id
            filtered.sort((a, b) => {
                if (a.recommended && !b.recommended) return -1;
                if (!a.recommended && b.recommended) return 1;
                const mainA = (a.tags && a.tags.length > 0) ? a.tags[0] : '';
                const mainB = (b.tags && b.tags.length > 0) ? b.tags[0] : '';
                const matchA = activeTags.has(mainA) ? 0 : 1;
                const matchB = activeTags.has(mainB) ? 0 : 1;
                if (matchA !== matchB) return matchA - matchB;
                return a.id - b.id;
            });
        } else {
            applySorting(filtered);
        }

        return filtered;
    }

    // ──────────────────────────────────
    // Clipboard Copy Function (Modern API only)
    // ──────────────────────────────────
    async function copyToClipboard(text, element) {
        try {
            await navigator.clipboard.writeText(text);
            showCopySuccess(element);
        } catch (err) {
            // Fallback for non-secure contexts or older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:-9999px;top:-9999px;';
                document.body.appendChild(textarea);
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                await navigator.clipboard.writeText(text);
                document.body.removeChild(textarea);
                showCopySuccess(element);
            } catch (err2) {
                console.warn('کپی انجام نشد:', err2);
            }
        }
    }

    function showCopySuccess(element) {
        const originalHTML = element.innerHTML;
        const originalTitle = element.getAttribute('title') || '';
        element.classList.add('copy-success');
        element.innerHTML = '✓ کپی شد!';
        element.setAttribute('title', 'آدرس در کلیپ‌بورد ذخیره شد');
        // Revert after 1.8 seconds
        setTimeout(() => {
            element.classList.remove('copy-success');
            element.innerHTML = originalHTML;
            element.setAttribute('title', originalTitle);
        }, 1800);
    }

    // ──────────────────────────────────
    // Social Media Badge HTML Generator
    // ──────────────────────────────────
    function getSocialBadges(social) {
        if (!social) return '';
        const platformConfig = {
            telegram_bot: { label: 'ربات تلگرام', cls: 'social-telegram', icon: 'fa-solid fa-robot' },
            telegram: { label: 'تلگرام', cls: 'social-telegram', icon: 'fa-brands fa-telegram' },
            instagram: { label: 'اینستاگرام', cls: 'social-instagram', icon: 'fa-brands fa-instagram' },
            twitter: { label: 'توییتر', cls: 'social-twitter', icon: 'fa-brands fa-x-twitter' },
            youtube: { label: 'یوتیوب', cls: 'social-youtube', icon: 'fa-brands fa-youtube' },
            eitaa: { label: 'ایتا', cls: 'social-eitaa', icon: 'fa-solid fa-paper-plane' },
            rubika: { label: 'روبیکا', cls: 'social-rubika', icon: 'fa-solid fa-comment-dots' },
            soroush: { label: 'سروش', cls: 'social-soroush', icon: 'fa-solid fa-feather' },
            bale: { label: 'بله', cls: 'social-bale', icon: 'fa-solid fa-dove' },
            aparat: { label: 'آپارات', cls: 'social-aparat', icon: 'fa-solid fa-video' },
            whatsapp: { label: 'واتساپ', cls: 'social-whatsapp', icon: 'fa-brands fa-whatsapp' },
            linkedin: { label: 'لینکدین', cls: 'social-linkedin', icon: 'fa-brands fa-linkedin' },
            discord: { label: 'دیسکورد', cls: 'social-discord', icon: 'fa-brands fa-discord' },
        };

        const badges = [];
        for (const [platform, url] of Object.entries(social)) {
            if (url && platformConfig[platform]) {
                const config = platformConfig[platform];
                badges.push(`
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"
                           class="social-badge ${config.cls}"
                           title="${config.label}"
                           onclick="event.stopPropagation();">
                            <i class="${config.icon}"></i> ${config.label}
                        </a>
                    `);
            }
        }
        return badges.length > 0 ?
            `
                <div class="social-title">شبکه‌های اجتماعی و لینک‌های مرتبط:</div>
                <div class="social-badges">${badges.join('')}</div>
            ` :
            '';
    }

    // ──────────────────────────────────
    // Custom Links HTML Generator
    // ──────────────────────────────────
    function getCustomLinksHtml(customLinks) {
        if (!customLinks || !Array.isArray(customLinks) || customLinks.length === 0) return '';
        const iconMap = {
            'blog': 'fa-solid fa-blog',
            'link': 'fa-solid fa-arrow-up-right-from-square',
            'website': 'fa-solid fa-globe',
            'download': 'fa-solid fa-download',
            'archive': 'fa-solid fa-box-archive',
            'support': 'fa-solid fa-headset',
            'contact': 'fa-solid fa-envelope',
            'app': 'fa-solid fa-mobile-screen-button',
            'heart': 'fa-solid fa-heart',
        };
        const badges = customLinks.map(cl => {
            const icon = (cl.icon && iconMap[cl.icon]) || iconMap['link'];
            return `
                    <a href="${escapeHtml(cl.url)}" target="_blank" rel="noopener noreferrer"
                       class="social-badge social-custom"
                       title="${escapeHtml(cl.title)}"
                       onclick="event.stopPropagation();">
                        <i class="${icon}"></i> ${escapeHtml(cl.title)}
                    </a>
                `;
        }).join('');
        return `<div class="custom-links-badges">${badges}</div>`;
    }

    // ──────────────────────────────────
    // Render All Site Cards (with Category Headers)
    // ──────────────────────────────────
    function renderSites(sites) {
        sitesGrid.innerHTML = '';
        emptyState.classList.remove('visible');

        if (sites.length === 0) {
            emptyState.classList.add('visible');
            sitesGrid.appendChild(emptyState);
            resultsCount.innerHTML = 'نمایش <strong>0</strong> از ' + sitesData.length + ' سایت';
            return;
        }

        // Re-attach emptyState to grid if it was moved
        if (!sitesGrid.contains(emptyState)) {
            sitesGrid.appendChild(emptyState);
        }
        emptyState.classList.remove('visible');

        resultsCount.innerHTML = 'نمایش <strong>' + sites.length + '</strong> از ' + sitesData.length + ' سایت';

        // Determine if we should show category headers (only in default sort mode)
        const showCategoryHeaders = (sortMode === 'default') && (activeTags.size === 0);
        let lastCategory = '';

        sites.forEach((site, index) => {
            const isExpanded = expandedCardIds.has(site.id);
            const isRec = site.recommended;
            const isBookmarked = bookmarkedIds.has(site.id);

            // Category header
            if (showCategoryHeaders) {
                const mainTag = (site.tags && site.tags.length > 0) ? site.tags[0] : '';
                if (mainTag !== lastCategory) {
                    lastCategory = mainTag;
                    const header = document.createElement('div');
                    header.className = 'category-header';
                    // Count sites in this category
                    const catCount = sites.filter(s => s.tags && s.tags.length > 0 && s.tags[0] === mainTag).length;
                    header.innerHTML = `
                        <span class="category-header-icon">${getCategoryIcon(mainTag)}</span>
                        <span class="category-header-title">${escapeHtml(mainTag)}</span>
                        <span class="category-header-count">${catCount}</span>
                        <span class="category-header-line"></span>
                    `;
                    sitesGrid.appendChild(header);
                }
            }

            const card = document.createElement('div');
            card.className =
                `site-card visible${isExpanded ? ' expanded' : ''}${isRec ? ' recommended' : ''}`;
            card.setAttribute('data-id', site.id);
            card.style.animationDelay = `${Math.min(index * 0.04, 1.2)}s`;

            // Recommended badge
            const recBadge = isRec ? '<span class="recommended-badge">\u2605 پیشنهادی</span>' : '';

            const socialBadgesHtml = getSocialBadges(site.social);
            const tagsMiniHtml = site.tags.map((t, i) => {
                const isMain = (i === 0);
                const cls = isMain ? 'card-tag-main' : 'card-tag-mini';
                return `<span class="${cls}">${escapeHtml(t)}</span>`;
            }).join('');

            card.innerHTML = `
                    <div class="card-main">
                        <button class="bookmark-btn${isBookmarked ? ' bookmarked' : ''}" 
                                data-bookmark-id="${site.id}" 
                                title="${isBookmarked ? 'حذف از بوکمارک' : 'افزودن به بوکمارک'}"
                                onclick="event.stopPropagation();">
                            <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                        </button>
                        <div class="card-info">
                            <div class="card-name">${escapeHtml(site.name)}</div>
                            <div class="card-tags-row">${recBadge}${tagsMiniHtml}</div>
                        </div>
                        <div class="card-actions">
                            <a href="${escapeHtml(site.unfilteredLink)}"
                               target="_blank"
                               rel="noopener noreferrer"
                               class="btn-go"
                               title="رفتن به سایت (باز شدن در تب جدید)"
                               onclick="event.stopPropagation();">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                برو به سایت
                            </a>
                            <span class="expand-arrow">
                                <i class="fa-solid fa-chevron-down"></i>
                            </span>
                        </div>
                    </div>
                    <div class="card-expanded">
                        <div class="expanded-description">${escapeHtml(site.description || '')}</div>
                        <div class="expanded-links">
                            <span class="expanded-link-item unfiltered"
                                  data-url="${escapeHtml(site.unfilteredLink)}"
                                  title="کلیک کنید تا آدرس فعلی کپی شود">
                                <i class="fa-solid fa-link"></i> آدرس فعلی
                            </span>
                            <span class="expanded-link-item"
                                  data-url="${escapeHtml(site.mainLink)}"
                                  title="کلیک کنید تا آدرس اصلی کپی شود">
                                <i class="fa-solid fa-globe"></i> آدرس اصلی
                            </span>
                        </div>
                        ${socialBadgesHtml}
                        ${getCustomLinksHtml(site.customLinks)}
                        ${site.donate ? `
                            <div class="donate-section">
                                <a href="${escapeHtml(site.donate)}" target="_blank" rel="noopener noreferrer"
                                   class="donate-badge"
                                   title="حمایت مالی"
                                   onclick="event.stopPropagation();">
                                    <i class="fa-solid fa-heart"></i> حمایت مالی ❤
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `;

            // Click on card (except interactive elements) toggles expand
            card.addEventListener('click', function(e) {
                // Don't toggle if clicking on a link, button, social badge, copy-link item, or inside card-expanded
                if (
                    e.target.closest('a') ||
                    e.target.closest('button') ||
                    e.target.closest('.social-badge') ||
                    e.target.closest('.expanded-link-item') ||
                    e.target.closest('.card-expanded')
                ) {
                    return;
                }
                toggleCardExpand(site.id);
            });

            sitesGrid.appendChild(card);
        });

        // ──────────────────────────────────
        // Attach delegated click handlers for copy-to-clipboard
        // ──────────────────────────────────
        sitesGrid.querySelectorAll('.expanded-link-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const url = this.getAttribute('data-url');
                if (url) {
                    copyToClipboard(url, this);
                }
            });
        });

        // ── Bookmark button handlers ──
        sitesGrid.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const siteId = parseInt(this.getAttribute('data-bookmark-id'));
                toggleBookmark(siteId);
            });
        });

        // Apply view mode class
        sitesGrid.classList.toggle('list-view', viewMode === 'list');
    }

    function toggleCardExpand(siteId) {
        if (expandedCardIds.has(siteId)) {
            expandedCardIds.delete(siteId);
        } else {
            expandedCardIds.add(siteId);
        }
        // Update the card in DOM
        const card = sitesGrid.querySelector(`[data-id="${siteId}"]`);
        if (card) {
            card.classList.toggle('expanded', expandedCardIds.has(siteId));
        }
        updateExpandAllBtn();
    }

    function expandAllCards() {
        allExpanded = true;
        const filtered = getFilteredSites();
        filtered.forEach(s => expandedCardIds.add(s.id));
        sitesGrid.querySelectorAll('.site-card').forEach(card => {
            card.classList.add('expanded');
        });
        updateExpandAllBtn();
    }

    function collapseAllCards() {
        allExpanded = false;
        expandedCardIds.clear();
        sitesGrid.querySelectorAll('.site-card.expanded').forEach(card => {
            card.classList.remove('expanded');
        });
        updateExpandAllBtn();
    }

    function updateExpandAllBtn() {
        const filtered = getFilteredSites();
        const expandedCount = filtered.filter(s => expandedCardIds.has(s.id)).length;
        allExpanded = expandedCount === filtered.length && filtered.length > 0;
        
        if (allExpanded) {
            expandAllBtn.innerHTML = '<i class="fa-solid fa-angles-up"></i> <span>بستن همه</span>';
            expandAllBtn.title = 'بستن همه کارت‌ها';
            expandAllBtn.classList.add('active');
        } else {
            expandAllBtn.innerHTML = '<i class="fa-solid fa-angles-down"></i> <span>باز کردن همه</span>';
            expandAllBtn.title = 'باز کردن همه کارت‌ها';
            expandAllBtn.classList.remove('active');
        }
    }

    function updateViewToggleUI() {
        if (viewMode === 'list') {
            viewToggle.innerHTML = '<i class="fa-solid fa-grip"></i> <span>نمای کارتی</span>';
            viewToggle.classList.add('active');
        } else {
            viewToggle.innerHTML = '<i class="fa-solid fa-list"></i> <span>نمای لیستی</span>';
            viewToggle.classList.remove('active');
        }
        sitesGrid.classList.toggle('list-view', viewMode === 'list');
    }

    function filterAndRender() {
        const filtered = getFilteredSites();
        // Keep expanded state for visible cards, remove for hidden ones
        const visibleIds = new Set(filtered.map(s => s.id));
        for (const id of [...expandedCardIds]) {
            if (!visibleIds.has(id)) {
                expandedCardIds.delete(id);
            }
        }
        renderSites(filtered);
        updateExpandAllBtn();
        scheduleHashUpdate();
    }



    // ──────────────────────────────────
    // Back-to-Top Button
    // ──────────────────────────────────
    function handleScroll() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ──────────────────────────────────
    // Event Listeners
    // ──────────────────────────────────
    // Debounced search input
    searchInput.addEventListener('input', function() {
        searchQuery = this.value;
        if (searchQuery.trim()) {
            clearSearchBtn.classList.add('visible');
        } else {
            clearSearchBtn.classList.remove('visible');
        }
        // Debounce
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filterAndRender();
        }, 200);
    });

    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.remove('visible');
        filterAndRender();
        searchInput.focus();
    });

    resetTagsBtn.addEventListener('click', function() {
        resetAllTags();
    });

    // Sort select
    sortSelect.addEventListener('change', function() {
        sortMode = this.value;
        filterAndRender();
    });

    // View toggle
    viewToggle.addEventListener('click', function() {
        viewMode = viewMode === 'card' ? 'list' : 'card';
        updateViewToggleUI();
        filterAndRender();
    });

    // Expand/Collapse all
    expandAllBtn.addEventListener('click', function() {
        if (allExpanded) {
            collapseAllCards();
        } else {
            expandAllCards();
        }
    });

    // Bookmark filter
    bookmarkFilterBtn.addEventListener('click', function() {
        showBookmarksOnly = !showBookmarksOnly;
        updateBookmarkFilterBtn();
        filterAndRender();
    });

    // Listen for back/forward navigation to restore hash state
    window.addEventListener('hashchange', function() {
        activeTags.clear();
        searchQuery = '';
        searchInput.value = '';
        clearSearchBtn.classList.remove('visible');
        readHash();
        renderTagChips();
        filterAndRender();
    });

    // Keyboard shortcut: Escape to clear search
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.activeElement === searchInput && searchQuery.trim()) {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.classList.remove('visible');
                filterAndRender();
            }
        }
    });

    // ──────────────────────────────────
    // Initial Render
    // ──────────────────────────────────
    function init() {
        // Load bookmarks from localStorage
        loadBookmarks();
        // Restore state from URL hash
        readHash();
        renderTagChips();
        filterAndRender();
        // Small delay to trigger entrance animations
        setTimeout(() => {
            document.querySelectorAll('.site-card').forEach(card => {
                card.classList.add('visible');
            });
        }, 50);

        // Update UI for view mode
        updateViewToggleUI();
        updateBookmarkFilterBtn();
        updateExpandAllBtn();

        console.log('✅ سایت‌های ایرانی آماده | ' + sitesData.length + ' سایت بارگذاری شد');
        console.log('🔍 قابلیت‌ها: جستجوی Real-time با نام، آدرس و تگ | فیلتر با تگ | کپی آدرس با کلیک');
        console.log('📱 طراحی کاملاً ریسپانسیو | بدون CDN خارجی | بدون شناور بودن بخش جستجو');
        console.log('🔗 ذخیره و اشتراک‌گذاری وضعیت فیلترها از طریق URL');
        console.log('⭐ بوکمارک محلی | 📋 نمای لیستی/کارتی | 🔽 مرتب‌سازی');
    }

    // ──────────────────────────────────
    // Start: Load data then initialize
    // ──────────────────────────────────
    loadSitesData();
})();
