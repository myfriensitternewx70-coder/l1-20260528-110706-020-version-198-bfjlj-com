(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var navLinks = document.querySelector("[data-nav-links]");
        if (navToggle && navLinks) {
            navToggle.addEventListener("click", function () {
                navLinks.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            start();
        }

        var filterShell = document.querySelector("[data-filter-shell]");
        if (filterShell) {
            var params = new URLSearchParams(window.location.search);
            var search = filterShell.querySelector("[data-filter-search]");
            var year = filterShell.querySelector("[data-filter-year]");
            var region = filterShell.querySelector("[data-filter-region]");
            var type = filterShell.querySelector("[data-filter-type]");
            var category = filterShell.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var empty = document.querySelector("[data-empty-state]");

            if (search && params.get("q")) {
                search.value = params.get("q");
            }

            function applyFilter() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var c = category ? category.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        ok = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        ok = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        ok = false;
                    }
                    if (c && card.getAttribute("data-category") !== c) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.style.display = shown ? "none" : "block";
                }
            }

            [search, year, region, type, category].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilter);
                    element.addEventListener("change", applyFilter);
                }
            });
            applyFilter();
        }

        var player = document.querySelector("[data-player]");
        if (player) {
            var video = player.querySelector("[data-video]");
            var button = player.querySelector("[data-play]");
            var attached = false;
            var hlsInstance = null;

            function attach() {
                if (!video || attached) {
                    return;
                }
                attached = true;
                var stream = video.getAttribute("data-stream");
                if (!stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                player.classList.add("is-playing");
                if (video) {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            player.addEventListener("click", function (event) {
                if (event.target === player) {
                    play();
                }
            });
            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                window.addEventListener("beforeunload", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        }
    });
})();
