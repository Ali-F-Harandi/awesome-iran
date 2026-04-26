(async function() {
    try {
        const response = await fetch('data/sites.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sitesData = await response.json();

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

        // ──────────────────────────────────
        // State
        // ──────────────────────────────────
        let activeTags = new Set();
        let searchQuery = '';
        let expandedCardIds = new Set();

        // ──────────────────────────────────
        // Build All Unique Tags
        // ──────────────────────────────────
        function getAllTags() {
            const tagCounts = {};
            sitesData.forEach(site => {
                site.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });
            return Object.entries(tagCounts)
                .sort((a, b) => {
                    if (b[1] !== a[1]) return b[1] - a[1];
                    return a[0].localeCompare(b[0], 'fa');
                })
                .map(([tag, count]) => ({ tag, count }));
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

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

            resetTagsBtn.classList.toggle('visible', activeTags.size > 0);

            tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
                chip.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tag = this.getAttribute('data-tag');
                    toggleTag(tag);
                });
            });
        }

        function toggleTag(tag) {
            if (activeTags.has(tag)) {
                activeTags.delete(tag);
            } else {
                activeTags.add(tag);
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
        // Filter (now includes URL search)
        // ──────────────────────────────────
        function getFilteredSites() {
            const query = searchQuery.trim().toLowerCase();
            return sitesData.filter(site => {
                const matchesSearch = !query || 
                    site.name.toLowerCase().includes(query) ||
                    site.tags.some(tag => tag.toLowerCase().includes(query)) ||
                    (site.description && site.description.toLowerCase().includes(query)) ||
                    site.mainLink.toLowerCase().includes(query) ||
                    site.unfilteredLink.toLowerCase().includes(query);

                const matchesTags = activeTags.size === 0 ||
                    site.tags.some(tag => activeTags.has(tag));

                return matchesSearch && matchesTags;
            });
        }

        // ──────────────────────────────────
        // Clipboard
        // ──────────────────────────────────
        function copyToClipboard(text, element) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    showCopySuccess(element);
                }).catch(() => fallbackCopy(text, element));
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
                console.warn('کپی انجام نشد:', err);
            }
            document.body.removeChild(textarea);
        }

        function showCopySuccess(element) {
            const originalHTML = element.innerHTML;
            element.classList.add('copy-success');
            element.innerHTML = '✓ کپی شد!';
            setTimeout(() => {
                element.classList.remove('copy-success');
                element.innerHTML = originalHTML;
            }, 1800);
        }

        // ──────────────────────────────────
        // Social badges
        // ──────────────────────────────────
        function getSocialBadges(social) {
            if (!social) return '';
            const platformConfig = {
                telegram:   { label: 'تلگرام',    cls: 'social-telegram' },
                instagram:  { label: 'اینستاگرام', cls: 'social-instagram' },
                twitter:    { label: 'توییتر',     cls: 'social-twitter' },
                youtube:    { label: 'یوتیوب',     cls: 'social-youtube' },
                eitaa:      { label: 'ایتا',       cls: 'social-eitaa' },
                rubika:     { label: 'روبیکا',     cls: 'social-rubika' },
                soroush:    { label: 'سروش',       cls: 'social-soroush' },
                bale:       { label: 'بله',         cls: 'social-bale' },
                aparat:     { label: 'آپارات',     cls: 'social-aparat' },
                whatsapp:   { label: 'واتساپ',     cls: 'social-whatsapp' },
                linkedin:   { label: 'لینکدین',    cls: 'social-linkedin' },
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
                            ${config.label}
                        </a>
                    `);
                }
            }
            return badges.length > 0
                ? `<div class="social-title">شبکه‌های اجتماعی:</div><div class="social-badges">${badges.join('')}</div>`
                : '';
        }

        // ──────────────────────────────────
        // Render Cards
        // ──────────────────────────────────
        function renderSites(sites) {
            sitesGrid.innerHTML = '';
            emptyState.classList.remove('visible');

            if (sites.length === 0) {
                emptyState.classList.add('visible');
                sitesGrid.appendChild(emptyState);
                resultsCount.innerHTML = 'نمایش <strong>۰</strong> سایت';
                return;
            }

            if (!sitesGrid.contains(emptyState)) {
                sitesGrid.appendChild(emptyState);
            }

            resultsCount.innerHTML = 'نمایش <strong>' + sites.length + '</strong> سایت';

            sites.forEach((site, index) => {
                const isExpanded = expandedCardIds.has(site.id);
                const isRec = site.recommended;
                const card = document.createElement('div');
                card.className = `site-card visible${isExpanded ? ' expanded' : ''}${isRec ? ' recommended' : ''}`;
                card.setAttribute('data-id', site.id);
                card.style.animationDelay = `${index * 0.04}s`;

                const socialBadgesHtml = getSocialBadges(site.social);
                const tagsMiniHtml = site.tags.map(t => `<span class="card-tag-mini">${escapeHtml(t)}</span>`).join('');

                card.innerHTML = `
                    <div class="card-main">
                        <div class="card-star${isRec ? ' active' : ''}">
                            ${isRec ? `
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            ` : `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            `}
                        </div>
                        <div class="card-info">
                            <div class="card-name">${escapeHtml(site.name)}</div>
                            <div class="card-tags-row">${tagsMiniHtml}</div>
                        </div>
                        <div class="card-actions">
                            <a href="${escapeHtml(site.unfilteredLink)}"
                               target="_blank"
                               rel="noopener noreferrer"
                               class="btn-go"
                               onclick="event.stopPropagation();">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                برو به سایت
                            </a>
                            <span class="expand-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="card-expanded">
                        <div class="expanded-description">${escapeHtml(site.description || '')}</div>
                        <div class="expanded-links">
                            <span class="expanded-link-item unfiltered"
                                  data-url="${escapeHtml(site.unfilteredLink)}"
                                  title="کلیک کنید تا آدرس علی کپی شود">
                                📋 آدرس علی
                            </span>
                            <span class="expanded-link-item"
                                  data-url="${escapeHtml(site.mainLink)}"
                                  title="کلیک کنید تا آدرس اصلی کپی شود">
                                🔗 آدرس اصلی
                            </span>
                        </div>
                        ${socialBadgesHtml}
                    </div>
                `;

                card.addEventListener('click', function(e) {
                    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.social-badge') || e.target.closest('.expanded-link-item')) {
                        return;
                    }
                    toggleCardExpand(site.id);
                });

                sitesGrid.appendChild(card);
            });

            // Attach copy handlers
            sitesGrid.querySelectorAll('.expanded-link-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = this.getAttribute('data-url');
                    if (url) copyToClipboard(url, this);
                });
            });
        }

        function toggleCardExpand(siteId) {
            if (expandedCardIds.has(siteId)) {
                expandedCardIds.delete(siteId);
            } else {
                expandedCardIds.add(siteId);
            }
            const card = sitesGrid.querySelector(`[data-id="${siteId}"]`);
            if (card) card.classList.toggle('expanded', expandedCardIds.has(siteId));
        }

        function filterAndRender() {
            const filtered = getFilteredSites();
            const visibleIds = new Set(filtered.map(s => s.id));
            for (const id of [...expandedCardIds]) {
                if (!visibleIds.has(id)) expandedCardIds.delete(id);
            }
            renderSites(filtered);
        }

        // ──────────────────────────────────
        // Event Listeners
        // ──────────────────────────────────
        searchInput.addEventListener('input', function() {
            searchQuery = this.value;
            clearSearchBtn.classList.toggle('visible', searchQuery.trim() !== '');
            filterAndRender();
        });

        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.classList.remove('visible');
            filterAndRender();
            searchInput.focus();
        });

        resetTagsBtn.addEventListener('click', resetAllTags);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.activeElement === searchInput && searchQuery.trim()) {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.classList.remove('visible');
                filterAndRender();
            }
        });

        // ──────────────────────────────────
        // Init
        // ──────────────────────────────────
        renderTagChips();
        filterAndRender();
        setTimeout(() => {
            document.querySelectorAll('.site-card').forEach(card => card.classList.add('visible'));
        }, 50);

        console.log('✅ سایت‌های ایرانی آماده | ' + sitesData.length + ' سایت بارگذاری شد');

    } catch (error) {
        console.error('❌ خطا در بارگذاری داده‌ها:', error);
        document.getElementById('emptyState').classList.add('visible');
        document.getElementById('emptyState').innerHTML = `
            <div class="empty-icon">⚠️</div>
            <h3>خطایی رخ داد</h3>
            <p>اطلاعات سایت‌ها بارگذاری نشد. لطفاً از وجود فایل data/sites.json اطمینان حاصل کنید.</p>
        `;
    }
})();
