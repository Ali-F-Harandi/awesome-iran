// ──────────────────────────────────
// Dark Mode (runs immediately)
// ──────────────────────────────────
(function initTheme() {
    const STORAGE_KEY = 'theme';
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Determine initial theme: saved > system > light
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
    let activeTags = new Set();
    let searchQuery = '';
    let expandedCardIds = new Set();
    let hashUpdateTimer = null;

    // ──────────────────────────────────
    // Persian Digit Converter
    // ──────────────────────────────────
    function toPersianDigits(str) {
        const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return str.toString().replace(/[0-9]/g, d => persianDigits[parseInt(d)]);
    }

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
    // Filter Logic (NOW INCLUDES URL SEARCH)
    // ──────────────────────────────────
    function getFilteredSites() {
        const query = searchQuery.trim().toLowerCase();
        return sitesData.filter(site => {
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

            return matchesSearch && matchesTags;
        }).sort((a, b) => {
            // Recommended items first, then by original order (id)
            if (a.recommended && !b.recommended) return -1;
            if (!a.recommended && b.recommended) return 1;
            return a.id - b.id;
        });
    }

    // ──────────────────────────────────
    // Clipboard Copy Function
    // ──────────────────────────────────
    function copyToClipboard(text, element) {
        // Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess(element);
            }).catch(() => {
                fallbackCopy(text, element);
            });
        } else {
            fallbackCopy(text, element);
        }
    }

    function fallbackCopy(text, element) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showCopySuccess(element);
        } catch (err) {
            // Silent fail - just don't show success
            console.warn('کپی انجام نشد:', err);
        }
        document.body.removeChild(textarea);
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
    // Render All Site Cards
    // ──────────────────────────────────
    function renderSites(sites) {
        sitesGrid.innerHTML = '';
        emptyState.classList.remove('visible');

        if (sites.length === 0) {
            emptyState.classList.add('visible');
            sitesGrid.appendChild(emptyState);
            resultsCount.innerHTML = 'نمایش <strong>۰</strong> از ' + toPersianDigits(sitesData.length) + ' سایت';
            return;
        }

        // Re-attach emptyState to grid if it was moved
        if (!sitesGrid.contains(emptyState)) {
            sitesGrid.appendChild(emptyState);
        }
        emptyState.classList.remove('visible');

        resultsCount.innerHTML = 'نمایش <strong>' + toPersianDigits(sites.length) + '</strong> از ' + toPersianDigits(sitesData.length) + ' سایت';

        sites.forEach((site, index) => {
            const isExpanded = expandedCardIds.has(site.id);
            const isRec = site.recommended;
            const card = document.createElement('div');
            card.className =
                `site-card visible${isExpanded ? ' expanded' : ''}${isRec ? ' recommended' : ''}`;
            card.setAttribute('data-id', site.id);
            card.style.animationDelay = `${index * 0.04}s`;

            // Recommended badge
            const recBadge = isRec ? '<span class="recommended-badge">\u2605 پیشنهادی</span>' : '';

            const socialBadgesHtml = getSocialBadges(site.social);
            const tagsMiniHtml = site.tags.map(t =>
                `<span class="card-tag-mini">${escapeHtml(t)}</span>`
            ).join('');

            card.innerHTML = `
                    <div class="card-main">
                        <div class="card-star${isRec ? ' active' : ''}">
                            ${isRec ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'}
                        </div>
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
                // Don't toggle if clicking on a link, button, social badge, or copy-link item
                if (
                    e.target.closest('a') ||
                    e.target.closest('button') ||
                    e.target.closest('.social-badge') ||
                    e.target.closest('.expanded-link-item')
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
        filterAndRender();
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

        console.log('✅ سایت‌های ایرانی آماده | ' + sitesData.length + ' سایت بارگذاری شد');
        console.log('🔍 قابلیت‌ها: جستجوی Real-time با نام، آدرس و تگ | فیلتر با تگ | کپی آدرس با کلیک');
        console.log('📱 طراحی کاملاً ریسپانسیو | بدون CDN خارجی | بدون شناور بودن بخش جستجو');
        console.log('🔗 ذخیره و اشتراک‌گذاری وضعیت فیلترها از طریق URL');
    }

    // ──────────────────────────────────
    // Start: Load data then initialize
    // ──────────────────────────────────
    loadSitesData();
})();
