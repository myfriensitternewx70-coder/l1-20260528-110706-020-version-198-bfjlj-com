(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = document.querySelector("[data-mobile-panel]");
        if (panel) {
          panel.classList.toggle("open");
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });
      show(0);
      start();
    }

    document.querySelectorAll("[data-card-filter]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-card-filter"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          card.style.display = text.indexOf(query) > -1 ? "" : "none";
        });
      });
    });

    var searchMount = document.querySelector("[data-search-results]");
    if (searchMount && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim().toLowerCase();
      var input = document.querySelector("[data-search-input]");
      var title = document.querySelector("[data-search-title]");
      if (input) {
        input.value = params.get("q") || "";
      }
      var results = window.SEARCH_INDEX.filter(function (item) {
        if (!query) {
          return true;
        }
        return item.search.indexOf(query) > -1;
      }).slice(0, 240);
      if (title) {
        title.textContent = query ? "搜索结果" : "精选影片";
      }
      if (!results.length) {
        searchMount.innerHTML = '<div class="empty-result">未找到相关视频，请尝试其他关键词。</div>';
      } else {
        searchMount.innerHTML = results.map(function (item) {
          return '<article class="movie-card">' +
            '<a class="movie-card-link" href="' + item.href + '">' +
            '<span class="movie-poster-wrap">' +
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">' +
            '<span class="movie-duration">' + item.duration + '</span>' +
            '<span class="movie-hover-text">' + item.oneLine + '</span>' +
            '</span>' +
            '<span class="movie-card-body">' +
            '<strong>' + item.title + '</strong>' +
            '<span class="movie-card-meta"><em>' + item.category + '</em><span>★ ' + item.rating + '</span></span>' +
            '</span>' +
            '</a>' +
            '</article>';
        }).join("");
      }
    }

    document.querySelectorAll(".video-box").forEach(function (box) {
      var video = box.querySelector("video");
      if (!video) {
        return;
      }
      var source = video.querySelector("source");
      var src = source ? source.getAttribute("src") : video.getAttribute("src");
      var overlay = box.querySelector(".player-overlay");
      var hls = null;

      function attach() {
        if (!src || video.getAttribute("data-ready") === "1") {
          return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("hidden");
        }
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      attach();
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
