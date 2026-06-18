(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
      button.textContent = menu.classList.contains("open") ? "×" : "☰";
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });
    show(0);
    play();
  }

  function initCardFilters() {
    var search = document.querySelector("[data-card-search]");
    var year = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!search && !year)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !selectedYear || cardYear === selectedYear;
        card.classList.toggle("hidden", !(matchQuery && matchYear));
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var overlay = wrap.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var started = false;
      var hls = null;

      function playVideo() {
        video.play().catch(function () {});
      }

      function start() {
        if (!stream) {
          return;
        }
        if (!started) {
          started = true;
          video.controls = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.src = stream;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
          }
        } else {
          playVideo();
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHeroSlider();
    initCardFilters();
    initPlayers();
  });
})();
