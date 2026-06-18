(function () {
    const body = document.body;
    const menuButton = document.querySelector(".menu-toggle");

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            const open = body.classList.toggle("menu-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll(".js-hero").forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const next = hero.querySelector(".hero-next");
        const prev = hero.querySelector(".hero-prev");
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.slide || 0));
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        const input = scope.querySelector(".js-card-filter");
        const type = scope.querySelector(".js-type-filter");
        const year = scope.querySelector(".js-year-filter");
        const category = scope.querySelector(".js-category-filter");
        const items = Array.from(scope.querySelectorAll(".movie-card, .ranking-row"));
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (input && query) {
            input.value = query;
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function apply() {
            const q = valueOf(input);
            const t = valueOf(type);
            const y = valueOf(year);
            const c = valueOf(category);

            items.forEach(function (item) {
                const text = (item.dataset.search || "").toLowerCase();
                const itemType = (item.dataset.type || "").toLowerCase();
                const itemYear = (item.dataset.year || "").toLowerCase();
                const itemCategory = (item.dataset.category || "").toLowerCase();
                const matched = (!q || text.indexOf(q) !== -1) &&
                    (!t || itemType.indexOf(t) !== -1) &&
                    (!y || itemYear === y) &&
                    (!c || itemCategory === c);
                item.classList.toggle("is-filter-hidden", !matched);
            });
        }

        [input, type, year, category].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        apply();
    });
})();
