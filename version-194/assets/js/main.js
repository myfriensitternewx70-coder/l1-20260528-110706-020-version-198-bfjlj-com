const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileNavigation() {
  const toggle = $('[data-mobile-toggle]');
  const panel = $('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
  });
}

function initHeroCarousel() {
  const carousel = $('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = $$('[data-hero-slide]', carousel);
  const dots = $$('[data-hero-dot]', carousel);
  const prev = $('[data-hero-prev]', carousel);
  const next = $('[data-hero-next]', carousel);

  if (slides.length <= 1) {
    return;
  }

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  restart();
}

function initImageFallbacks() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
      image.removeAttribute('src');
    }, { once: true });
  });
}

function initCategoryFilters() {
  const bar = $('[data-filter-bar]');
  const list = $('[data-filter-list]');

  if (!bar || !list) {
    return;
  }

  const textInput = $('[data-filter-text]', bar);
  const genreSelect = $('[data-filter-genre]', bar);
  const yearSelect = $('[data-filter-year]', bar);
  const count = $('[data-filter-count]', bar);
  const cards = $$('[data-card]', list);

  const apply = () => {
    const text = (textInput?.value || '').trim().toLowerCase();
    const genre = genreSelect?.value || '';
    const year = yearSelect?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year,
      ].join(' ').toLowerCase();
      const matchesText = !text || haystack.includes(text);
      const matchesGenre = !genre || (card.dataset.genre || '').includes(genre);
      const matchesYear = !year || card.dataset.year === year;
      const shouldShow = matchesText && matchesGenre && matchesYear;

      card.hidden = !shouldShow;
      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `${visible} 部`;
    }
  };

  [textInput, genreSelect, yearSelect].forEach((control) => {
    control?.addEventListener('input', apply);
    control?.addEventListener('change', apply);
  });

  apply();
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
    <article class="movie-card">
      <a class="movie-card__cover" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${movie.image}" alt="${escapeHtml(movie.title)} 封面" loading="lazy">
        <span class="movie-card__score">${escapeHtml(movie.score)}</span>
        <span class="movie-card__play">▶</span>
      </a>
      <div class="movie-card__body">
        <div class="movie-card__meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="movie-card__tags">${tags}</div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initSearchPage() {
  const results = $('[data-search-results]');
  const summary = $('[data-search-summary]');
  const input = $('[data-search-page-input]');

  if (!results || !summary || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  if (input) {
    input.value = query;
  }

  if (!query) {
    const hot = window.MOVIE_SEARCH_INDEX.slice(0, 24);
    summary.textContent = '展示部分热门影片；输入关键词可检索全站影片。';
    results.innerHTML = hot.map(movieCardTemplate).join('');
    initImageFallbacks();
    return;
  }

  const lower = query.toLowerCase();
  const matched = window.MOVIE_SEARCH_INDEX.filter((movie) => {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.oneLine,
    ].join(' ').toLowerCase().includes(lower);
  });

  summary.textContent = `为您找到 ${matched.length} 个与 “${query}” 相关的影片`;
  results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join('');

  if (matched.length > 240) {
    const note = document.createElement('p');
    note.className = 'search-summary';
    note.textContent = `结果较多，已显示前 240 个，请继续输入更精确关键词。`;
    results.after(note);
  }

  initImageFallbacks();
}

async function attachHls(video) {
  const source = video.dataset.hls;

  if (!source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  try {
    const module = await import('./hls-vendor.js');
    const Hls = module.H || module.default;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    }
  } catch (error) {
    console.warn('HLS 初始化失败，将保留原生播放源。', error);
    video.src = source;
  }
}

function initPlayer() {
  const video = $('#movie-player');
  const playButton = $('[data-play-now]');

  if (!video) {
    return;
  }

  const ready = attachHls(video);

  const hideOverlay = () => {
    playButton?.classList.add('is-hidden');
  };

  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', () => {
    if (video.currentTime === 0) {
      playButton?.classList.remove('is-hidden');
    }
  });

  playButton?.addEventListener('click', async () => {
    await ready;
    try {
      await video.play();
      hideOverlay();
    } catch (error) {
      console.warn('浏览器阻止了自动播放，请使用播放器控件手动播放。', error);
      hideOverlay();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initHeroCarousel();
  initImageFallbacks();
  initCategoryFilters();
  initSearchPage();
  initPlayer();
});
