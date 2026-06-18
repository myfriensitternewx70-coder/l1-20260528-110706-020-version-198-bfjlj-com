(function () {
  function findClosest(element, selector) {
    if (!element || !element.closest) {
      return null;
    }
    return element.closest(selector);
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = findClosest(panel, '[data-filter-scope]') || document;
    var searchInput = panel.querySelector('[data-search-input]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var typeValue = normalize(typeFilter ? typeFilter.value : '');
      var yearValue = normalize(yearFilter ? yearFilter.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
        var matchedYear = !yearValue || cardYear === yearValue;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedType && matchedYear));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play-trigger]');
    var stream = player.getAttribute('data-stream-url') || (trigger ? trigger.getAttribute('data-stream-url') : '');
    var hlsInstance = null;

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      if (video.getAttribute('data-ready') !== '1') {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.setAttribute('data-ready', '1');
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          video.setAttribute('data-ready', '1');
        } else {
          video.src = stream;
          video.setAttribute('data-ready', '1');
        }
      }

      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }

      playVideo();
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
