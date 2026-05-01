// ──────────────────────────────────
// Dark Mode (runs immediately)
// ──────────────────────────────────
(function initTheme() {
    const STORAGE_KEY = 'theme';
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    let theme = localStorage.getItem(STORAGE_KEY);
    if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);

    toggle.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_KEY, next);
    });
})();

(function() {
    // ──────────────────────────────────
    // State
    // ──────────────────────────────────
    let sitesData = [];
    let tagsMap = new Map();      // id → { name, icon, iconFA }
    let socialsMap = new Map();  // key → { label, icon, iconFA, cls }
    let activeTags = new Set();   // contains tag *names* (for filtering)
    let searchQuery = '';
    let expandedCardIds = new Set();
    let hashUpdateTimer = null;
    let sortMode = 'default';
    let viewMode = 'card';
    let showBookmarksOnly = false;
    let bookmarkedIds = new Set();
    let allExpanded = false;
    let debounceTimer = null;

    const BOOKMARK_KEY = 'awesome-iran-bookmarks';

    // site availability check state
    let siteCheckStatus = new Map();   // siteId -> 'success' | 'fail' | 'loading'
    let siteCheckControllers = new Map(); // siteId -> AbortController

    // ──────────────────────────────────
    // DOM References
    // ──────────────────────────────────
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const tagsContainer = document.getElementById('tagsContainer');
    const resetTagsBtn = document.getElementById('resetTags');
    const sitesGrid = document.getElementById('sitesGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');
    const footerDateEl = document.getElementById('footerDate');
    const backToTopBtn = document.getElementById('backToTop');
    const sortSelect = document.getElementById('sortSelect');
    const viewToggle = document.getElementById('viewToggle');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const bookmarkFilterBtn = document.getElementById('bookmarkFilterBtn');
    const checkAllBtn = document.getElementById('checkAllBtn');

    // ──────────────────────────────────
    // Bookmarks: Load/Save
    // ──────────────────────────────────
    function loadBookmarks() {
        try {
            const data = localStorage.getItem(BOOKMARK_KEY);
            if (data) {
                bookmarkedIds = new Set(JSON.parse(data));
            }
        } catch(e) {
            bookmarkedIds = new Set();
        }
    }

    function saveBookmarks() {
        try {
            localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...bookmarkedIds]));
        } catch(e) {
            // silently fail
        }
    }

    function toggleBookmark(siteId) {
        if (bookmarkedIds.has(siteId)) {
            bookmarkedIds.delete(siteId);
        } else {
            bookmarkedIds.add(siteId);
        }
        saveBookmarks();
        const btn = sitesGrid.querySelector(`[data-id="${siteId}"] .bookmark-btn`);
        if (btn) {
            btn.classList.toggle('bookmarked', bookmarkedIds.has(siteId));
            btn.innerHTML = bookmarkedIds.has(siteId)
                ? '<i class="fa-solid fa-bookmark"></i>'
                : '<i class="fa-regular fa-bookmark"></i>';
        }
        updateBookmarkFilterBtn();
    }

    function updateBookmarkFilterBtn() {
        bookmarkFilterBtn.classList.toggle('active', showBookmarksOnly);
    }

    // ──────────────────────────────────
    // Tag Helper Functions
    // ──────────────────────────────────
    function getTagName(tagId) {
        const tag = tagsMap.get(tagId);
        return tag ? tag.name : '';
    }

    function getTagIcon(tagId) {
        const tag = tagsMap.get(tagId);
        return tag ? tag.icon : '📌';
    }

    function getTagIconFA(tagId) {
        const tag = tagsMap.get(tagId);
        return tag ? tag.iconFA : '';
    }

    // Returns HTML for category header icon: prefers Font Awesome, falls back to emoji
    function getCategoryIcon(tagId) {
        const tag = tagsMap.get(tagId);
        if (!tag) return '<span>📌</span>';
        if (tag.iconFA) {
            return `<i class="${tag.iconFA}"></i>`;
        }
        return `<span>${tag.icon}</span>`;
    }

    // For search/filter: convert site tag IDs to lowercased names
    function getSiteTagNames(site) {
        return site.tags.map(id => getTagName(id)).filter(Boolean);
    }

    // ──────────────────────────────────
    // Load Data
    // ──────────────────────────────────
    async function loadSitesData() {
        try {
            // Load tags first
            const tagsRes = await fetch('data/tags.json');
            if (!tagsRes.ok) throw new Error('خطا در بارگذاری تگ‌ها');
            const tagsList = await tagsRes.json();
            tagsMap.clear();
            tagsList.forEach(t => tagsMap.set(t.id, t));

            // Load socials
            const socialsRes = await fetch('data/socials.json');
            if (socialsRes.ok) {
                const socialsList = await socialsRes.json();
                socialsMap.clear();
                socialsList.forEach(s => socialsMap.set(s.key, s));
            }

            const response = await fetch('data/sites.json');
            if (!response.ok) throw new Error('خطا در بارگذاری داده‌ها');
            sitesData = await response.json();
            loadMetaData();
            init();
        } catch (error) {
            console.error('خطا در بارگذاری:', error);
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
            if (meta.footerLinks) {
                renderFooterLinks(meta.footerLinks);
            }
        } catch (e) {
            // Silently ignore meta.json errors
        }
    }

    function renderFooterLinks(links) {
        const container = document.getElementById('footerLinksContainer');
        if (!container) return;
        if (!links || !Array.isArray(links) || links.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = '';
        let html = '<div class="footer-links">';
        links.forEach(link => {
            let iconHtml = '';
            if (link.iconFA) {
                iconHtml = `<i class="${escapeHtml(link.iconFA)}"></i>`;
            } else if (link.icon) {
                iconHtml = `<span class="link-icon">${link.icon}</span>`;
            }
            html += `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="footer-link-item" title="${escapeHtml(link.label)}">
                ${iconHtml}${escapeHtml(link.label)}</a>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ──────────────────────────────────
    // Build All Unique Tags (by name, sorted by frequency)
    // ──────────────────────────────────
    function getAllTags() {
        const tagCounts = {};
        sitesData.forEach(site => {
            site.tags.forEach(tagId => {
                const name = getTagName(tagId);
                if (name) {
                    tagCounts[name] = (tagCounts[name] || 0) + 1;
                }
            });
        });
        return Object.entries(tagCounts)
            .sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1];
                return a[0].localeCompare(b[0], 'fa');
            })
            .map(([name, count]) => ({ name, count }));
    }

    // ──────────────────────────────────
    // Render Tag Chips (by name, filtering still uses activeTags names)
    // ──────────────────────────────────
    function renderTagChips() {
        const allTags = getAllTags();
        tagsContainer.innerHTML = allTags.map(({ name, count }) => {
            const isActive = activeTags.has(name);
            return `
                <span class="tag-chip${isActive ? ' active' : ''}"
                      data-tag="${escapeHtml(name)}"
                      role="button"
                      tabindex="0"
                      aria-pressed="${isActive}">
                    ${escapeHtml(name)}
                    <span class="tag-count">${count}</span>
                </span>
            `;
        }).join('');

        if (activeTags.size > 0) {
            resetTagsBtn.classList.add('visible');
        } else {
            resetTagsBtn.classList.remove('visible');
        }

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

    function toggleTag(tagName) {
        if (activeTags.has(tagName)) {
            activeTags.delete(tagName);
        } else {
            activeTags.add(tagName);
        }
        renderTagChips();
        filterAndRender();
        sitesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetAllTags() {
        activeTags.clear();
        renderTagChips();
        filterAndRender();
    }

    // ──────────────────────────────────
    // URL Hash Persistence (tags still as names in hash)
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
    // Sort Logic (category is now determined by first tag ID's name)
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
            // default: group by first tag name frequency, then recommended, then ID
            const tagFreq = {};
            sitesData.forEach(site => {
                const mainTagName = getTagName(site.tags[0] || '');
                if (mainTagName) tagFreq[mainTagName] = (tagFreq[mainTagName] || 0) + 1;
            });
            const sortedTagNames = Object.entries(tagFreq)
                .sort((a, b) => {
                    if (b[1] !== a[1]) return b[1] - a[1];
                    return a[0].localeCompare(b[0], 'fa');
                })
                .map(([name]) => name);
            const tagOrder = {};
            sortedTagNames.forEach((name, idx) => tagOrder[name] = idx);

            sites.sort((a, b) => {
                const mainA = getTagName(a.tags[0] || '');
                const mainB = getTagName(b.tags[0] || '');
                const orderA = mainA in tagOrder ? tagOrder[mainA] : 9999;
                const orderB = mainB in tagOrder ? tagOrder[mainB] : 9999;
                if (orderA !== orderB) return orderA - orderB;
                if (a.recommended && !b.recommended) return -1;
                if (!a.recommended && b.recommended) return 1;
                return a.id - b.id;
            });
        }
        return sites;
    }

    // ──────────────────────────────────
    // Filter Logic (search by name, description, URL, and tag names)
    // ──────────────────────────────────
    function getFilteredSites() {
        const query = searchQuery.trim().toLowerCase();

        let filtered = sitesData.filter(site => {
            // Search: check site name, description, URLs, and also tag names
            const siteTagNames = getSiteTagNames(site).map(n => n.toLowerCase());
            const matchesSearch =
                !query ||
                site.name.toLowerCase().includes(query) ||
                (site.description && site.description.toLowerCase().includes(query)) ||
                site.mainLink.toLowerCase().includes(query) ||
                site.unfilteredLink.toLowerCase().includes(query) ||
                siteTagNames.some(tagName => tagName.includes(query));

            // Tag filter: site matches if any of its tag names is in activeTags
            const matchesTags =
                activeTags.size === 0 ||
                siteTagNames.some(tagName => activeTags.has(tagName));

            const matchesBookmarks = !showBookmarksOnly || bookmarkedIds.has(site.id);

            return matchesSearch && matchesTags && matchesBookmarks;
        });

        if (sortMode === 'default' && activeTags.size > 0) {
            filtered.sort((a, b) => {
                if (a.recommended && !b.recommended) return -1;
                if (!a.recommended && b.recommended) return 1;
                const mainA = getTagName(a.tags[0] || '');
                const mainB = getTagName(b.tags[0] || '');
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
    // Clipboard Copy Function
    // ──────────────────────────────────
    async function copyToClipboard(text, element) {
        try {
            await navigator.clipboard.writeText(text);
            showCopySuccess(element);
        } catch (err) {
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
        setTimeout(() => {
            element.classList.remove('copy-success');
            element.innerHTML = originalHTML;
            element.setAttribute('title', originalTitle);
        }, 1800);
    }

    // ──────────────────────────────────
    // Social Media Badge HTML Generator (now dynamic from socials.json)
    // ──────────────────────────────────
    function getSocialBadges(social) {
        if (!social) return '';
        const badges = [];
        for (const [key, url] of Object.entries(social)) {
            if (url && socialsMap.has(key)) {
                const cfg = socialsMap.get(key);
                const iconHtml = cfg.iconFA ? `<i class="${cfg.iconFA}"></i>` : cfg.icon;
                badges.push(`
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"
                       class="social-badge ${cfg.cls || 'social-custom'}"
                       title="${cfg.label}"
                       onclick="event.stopPropagation();">
                        ${iconHtml} ${cfg.label}
                    </a>
                `);
            }
        }
        return badges.length > 0 ? `
                <div class="social-title">شبکه‌های اجتماعی و لینک‌های مرتبط:</div>
                <div class="social-badges">${badges.join('')}</div>
            ` : '';
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
    // Site Availability Check
    // ──────────────────────────────────
    async function checkSiteInner(siteId) {
        const site = sitesData.find(s => s.id === siteId);
        if (!site) return;

        if (siteCheckControllers.has(siteId)) {
            siteCheckControllers.get(siteId).abort();
            siteCheckControllers.delete(siteId);
        }

        siteCheckStatus.set(siteId, 'loading');

        const url = site.unfilteredLink;
        const controller = new AbortController();
        siteCheckControllers.set(siteId, controller);

        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            await fetch(url, { mode: 'no-cors', signal: controller.signal, cache: 'no-cache' });
            clearTimeout(timeoutId);
            siteCheckStatus.set(siteId, 'success');
        } catch (err) {
            clearTimeout(timeoutId);
            siteCheckStatus.set(siteId, 'fail');
        } finally {
            siteCheckControllers.delete(siteId);
        }
    }

    function updateCheckButtonUI(siteId) {
        const btn = sitesGrid.querySelector(`[data-id="${siteId}"] .check-site-btn`);
        if (!btn) return;
        const status = siteCheckStatus.get(siteId);
        btn.classList.remove('checking', 'check-success', 'check-fail');
        btn.disabled = false;
        if (status === 'loading') {
            btn.classList.add('checking');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-pulse"></i>';
            btn.title = 'در حال بررسی...';
            btn.disabled = true;
        } else if (status === 'success') {
            btn.classList.add('check-success');
            btn.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            btn.title = 'سایت در دسترس است';
        } else {
            btn.classList.add('check-fail');
            btn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            btn.title = 'سایت در دسترس نیست یا خطا در بررسی';
        }
    }

    function checkSiteAvailability(siteId) {
        const btn = sitesGrid.querySelector(`[data-id="${siteId}"] .check-site-btn`);
        if (!btn) return;

        checkSiteInner(siteId).finally(() => updateCheckButtonUI(siteId));
        btn.classList.add('checking');
        btn.classList.remove('check-success', 'check-fail');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-pulse"></i>';
        btn.title = 'در حال بررسی...';
        btn.disabled = true;
    }

    async function checkAllSites() {
        if (!checkAllBtn) return;

        for (const [id, controller] of siteCheckControllers) {
            controller.abort();
        }
        siteCheckControllers.clear();

        const sitesToCheck = [...sitesData];
        const total = sitesToCheck.length;
        let completed = 0;

        checkAllBtn.classList.add('active');
        checkAllBtn.disabled = true;
        const updateProgress = () => {
            checkAllBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> <span>بررسی سایت‌ها (${completed}/${total})</span>`;
        };
        updateProgress();

        const concurrency = 6;
        const queue = sitesToCheck.slice();

        async function worker() {
            while (queue.length > 0) {
                const site = queue.shift();
                await checkSiteInner(site.id);
                completed++;
                updateProgress();
                updateCheckButtonUI(site.id);
            }
        }

        const workers = Array(concurrency).fill().map(() => worker());
        await Promise.all(workers);

        checkAllBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>بررسی سایت‌ها</span>';
        checkAllBtn.classList.remove('active');
        checkAllBtn.disabled = false;
    }

    // ──────────────────────────────────
    // Render All Site Cards (with Category Headers using new tag system)
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

        if (!sitesGrid.contains(emptyState)) {
            sitesGrid.appendChild(emptyState);
        }
        emptyState.classList.remove('visible');

        resultsCount.innerHTML = 'نمایش <strong>' + sites.length + '</strong> از ' + sitesData.length + ' سایت';

        const showCategoryHeaders = (sortMode === 'default') && (activeTags.size === 0);
        let lastCategory = '';

        sites.forEach((site, index) => {
            const isExpanded = expandedCardIds.has(site.id);
            const isRec = site.recommended;
            const isBookmarked = bookmarkedIds.has(site.id);

            if (showCategoryHeaders) {
                const mainTagId = site.tags[0];
                const mainTagName = getTagName(mainTagId);
                if (mainTagName && mainTagName !== lastCategory) {
                    lastCategory = mainTagName;
                    const header = document.createElement('div');
                    header.className = 'category-header';
                    const catCount = sites.filter(s => mainTagId && s.tags[0] === mainTagId).length;
                    header.innerHTML = `
                        <span class="category-header-icon">${getCategoryIcon(mainTagId)}</span>
                        <span class="category-header-title">${escapeHtml(mainTagName)}</span>
                        <span class="category-header-count">${catCount}</span>
                        <span class="category-header-line"></span>
                    `;
                    sitesGrid.appendChild(header);
                }
            }

            const card = document.createElement('div');
            card.className = `site-card visible${isExpanded ? ' expanded' : ''}${isRec ? ' recommended' : ''}`;
            card.setAttribute('data-id', site.id);
            card.style.animationDelay = `${Math.min(index * 0.04, 1.2)}s`;

            const recBadge = isRec ? '<span class="recommended-badge">\u2605 پیشنهادی</span>' : '';

            const socialBadgesHtml = getSocialBadges(site.social);

            // Build mini tags: first tag as "card-tag-main", others as "card-tag-mini"
            const tagsMiniHtml = site.tags.map((tagId, i) => {
                const name = getTagName(tagId);
                if (!name) return '';
                const isMain = (i === 0);
                const cls = isMain ? 'card-tag-main' : 'card-tag-mini';
                return `<span class="${cls}">${escapeHtml(name)}</span>`;
            }).join('');

            // Expanded links
            let expandedLinksHtml;
            if (site.unfilteredLink === site.mainLink) {
                expandedLinksHtml = `
                    <div class="expanded-links">
                        <span class="expanded-link-item"
                              data-url="${escapeHtml(site.unfilteredLink)}"
                              title="کلیک کنید تا آدرس کپی شود">
                            <i class="fa-solid fa-copy"></i> کپی آدرس
                        </span>
                    </div>
                `;
            } else {
                expandedLinksHtml = `
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
                `;
            }

            // Check button
            let checkBtnHtml;
            const cachedStatus = siteCheckStatus.get(site.id);
            if (cachedStatus === 'loading') {
                checkBtnHtml = `<button class="check-site-btn checking" data-check-id="${site.id}" title="در حال بررسی..." disabled><i class="fa-solid fa-spinner fa-pulse"></i></button>`;
            } else if (cachedStatus === 'success') {
                checkBtnHtml = `<button class="check-site-btn check-success" data-check-id="${site.id}" title="سایت در دسترس است"><i class="fa-solid fa-circle-check"></i></button>`;
            } else if (cachedStatus === 'fail') {
                checkBtnHtml = `<button class="check-site-btn check-fail" data-check-id="${site.id}" title="سایت در دسترس نیست یا خطا در بررسی"><i class="fa-solid fa-circle-xmark"></i></button>`;
            } else {
                checkBtnHtml = `<button class="check-site-btn" data-check-id="${site.id}" title="بررسی در دسترس بودن سایت"><i class="fa-solid fa-bolt"></i></button>`;
            }

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
                            ${checkBtnHtml}
                        </div>
                    </div>
                    <div class="card-expanded">
                        <div class="expanded-description">${escapeHtml(site.description || '')}</div>
                        ${expandedLinksHtml}
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

            card.addEventListener('click', function(e) {
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

        // Attach delegated click handlers for copy-to-clipboard
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

        // Bookmark button handlers
        sitesGrid.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const siteId = parseInt(this.getAttribute('data-bookmark-id'));
                toggleBookmark(siteId);
            });
        });

        // Check site button handlers
        sitesGrid.querySelectorAll('.check-site-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const siteId = parseInt(this.getAttribute('data-check-id'));
                checkSiteAvailability(siteId);
            });
        });

        sitesGrid.classList.toggle('list-view', viewMode === 'list');
    }

    function toggleCardExpand(siteId) {
        if (expandedCardIds.has(siteId)) {
            expandedCardIds.delete(siteId);
        } else {
            expandedCardIds.add(siteId);
        }
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
    searchInput.addEventListener('input', function() {
        searchQuery = this.value;
        if (searchQuery.trim()) {
            clearSearchBtn.classList.add('visible');
        } else {
            clearSearchBtn.classList.remove('visible');
        }
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

    sortSelect.addEventListener('change', function() {
        sortMode = this.value;
        filterAndRender();
    });

    viewToggle.addEventListener('click', function() {
        viewMode = viewMode === 'card' ? 'list' : 'card';
        updateViewToggleUI();
        filterAndRender();
    });

    expandAllBtn.addEventListener('click', function() {
        if (allExpanded) {
            collapseAllCards();
        } else {
            expandAllCards();
        }
    });

    bookmarkFilterBtn.addEventListener('click', function() {
        showBookmarksOnly = !showBookmarksOnly;
        updateBookmarkFilterBtn();
        filterAndRender();
    });

    if (checkAllBtn) {
        checkAllBtn.addEventListener('click', function() {
            checkAllSites();
        });
    }

    window.addEventListener('hashchange', function() {
        activeTags.clear();
        searchQuery = '';
        searchInput.value = '';
        clearSearchBtn.classList.remove('visible');
        readHash();
        renderTagChips();
        filterAndRender();
    });

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
        loadBookmarks();
        readHash();
        renderTagChips();
        filterAndRender();
        setTimeout(() => {
            document.querySelectorAll('.site-card').forEach(card => {
                card.classList.add('visible');
            });
        }, 50);

        updateViewToggleUI();
        updateBookmarkFilterBtn();
        updateExpandAllBtn();

        console.log('✅ سایت‌های ایرانی آماده | ' + sitesData.length + ' سایت بارگذاری شد');
        console.log('🔄 سیستم پویای تگ‌ها و شبکه‌های اجتماعی از فایل‌های JSON');
    }

    loadSitesData();
})();