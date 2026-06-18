(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  const filterGrid = document.querySelector('[data-filter-grid]');

  if (filterPanel && filterGrid) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const region = filterPanel.querySelector('[data-filter-region]');
    const type = filterPanel.querySelector('[data-filter-type]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const sort = filterPanel.querySelector('[data-filter-sort]');
    const empty = document.querySelector('[data-empty-state]');
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
    const initialQuery = new URLSearchParams(window.location.search).get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function textOf(card) {
      return [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
    }

    function apply() {
      const query = valueOf(input);
      const regionValue = valueOf(region);
      const typeValue = valueOf(type);
      const yearValue = valueOf(year);
      let shown = 0;

      cards.forEach(function (card) {
        const matched = (!query || textOf(card).includes(query)) &&
          (!regionValue || (card.dataset.region || '').toLowerCase() === regionValue) &&
          (!typeValue || (card.dataset.type || '').toLowerCase() === typeValue) &&
          (!yearValue || (card.dataset.year || '').toLowerCase() === yearValue);

        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (sort) {
        const visible = cards.filter(function (card) {
          return !card.hidden;
        });
        const mode = sort.value;

        visible.sort(function (a, b) {
          if (mode === 'new') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (mode === 'title') {
            return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
          }
          return 0;
        });

        visible.forEach(function (card) {
          filterGrid.appendChild(card);
        });
      }

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, region, type, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
