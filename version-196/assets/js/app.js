(function () {
    var nav = document.querySelector('.site-nav');
    var menuButton = document.querySelector('.mobile-menu-button');

    if (nav && menuButton) {
        menuButton.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll('img.movie-cover').forEach(function (image) {
        image.addEventListener('error', function () {
            var holder = image.closest('.poster-frame, .detail-poster, .category-poster, .detail-backdrop');
            if (holder) {
                holder.classList.add('no-image');
            }
        }, { once: true });
    });

    var searchInput = document.querySelector('.movie-search');
    var sortSelect = document.querySelector('.movie-sort');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.sortable-grid .movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var activeFilter = '全部';

    function matchesCard(card, query) {
        var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
        var filterOk = activeFilter === '全部' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        var queryOk = !query || haystack.indexOf(query.toLowerCase()) !== -1;
        return filterOk && queryOk;
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? searchInput.value.trim() : '';
        cards.forEach(function (card) {
            card.classList.toggle('hide-card', !matchesCard(card, query));
        });
    }

    function sortCards() {
        if (!cards.length || !sortSelect) {
            return;
        }
        var value = sortSelect.value;
        var grid = cards[0].parentElement;
        var sorted = cards.slice().sort(function (a, b) {
            var ay = Number(a.getAttribute('data-year')) || 0;
            var by = Number(b.getAttribute('data-year')) || 0;
            var ah = Number(a.getAttribute('data-heat')) || 0;
            var bh = Number(b.getAttribute('data-heat')) || 0;
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';

            if (value === 'year-asc') {
                return ay - by;
            }
            if (value === 'heat-desc') {
                return bh - ah;
            }
            if (value === 'title-asc') {
                return at.localeCompare(bt, 'zh-Hans-CN');
            }
            return by - ay;
        });
        sorted.forEach(function (card) {
            grid.appendChild(card);
        });
        cards = sorted;
        filterCards();
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (item) {
                item.classList.remove('active');
            });
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter') || '全部';
            filterCards();
        });
    });

    if (searchInput) {
        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }

    filterCards();

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var url = shell.getAttribute('data-hls');
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !video || !url) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
