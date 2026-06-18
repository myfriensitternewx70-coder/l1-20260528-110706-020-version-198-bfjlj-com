(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menuPanel = document.querySelector('[data-menu-panel]');
  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function () {
      menuPanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    startTimer();
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  forms.forEach(function (form) {
    var grid = form.parentElement.querySelector('[data-filter-grid]');
    var emptyTip = form.parentElement.querySelector('[data-empty-tip]');
    var keyword = form.querySelector('input[name="keyword"]');
    var params = new URLSearchParams(window.location.search);
    var queryKeyword = params.get('q');

    if (queryKeyword && keyword) {
      keyword.value = queryKeyword;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
      var word = normalize(form.keyword ? form.keyword.value : '');
      var region = normalize(form.region ? form.region.value : '');
      var type = normalize(form.type ? form.type.value : '');
      var year = normalize(form.year ? form.year.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var ok = true;

        if (word && haystack.indexOf(word) === -1) {
          ok = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          ok = false;
        }
        if (type && normalize(card.getAttribute('data-type')) !== type) {
          ok = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (emptyTip) {
        emptyTip.classList.toggle('is-visible', visible === 0);
      }
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    apply();
  });
})();
