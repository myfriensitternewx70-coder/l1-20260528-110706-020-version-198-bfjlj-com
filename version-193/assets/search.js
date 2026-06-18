
document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('[data-search-input]');
  const grid = document.querySelector('[data-search-grid]');
  const count = document.querySelector('[data-search-count]');
  const chips = [...document.querySelectorAll('[data-filter-chip]')];
  if (!input || !grid || !window.CATALOG) return;

  const params = new URLSearchParams(location.search);
  const initial = (params.get('q') || '').trim();
  const genre = (params.get('genre') || '').trim();
  input.value = initial;

  function card(item) {
    const html = `
      <a class="movie-card" href="${item.detailUrl}">
        <div class="movie-poster">
          <img src="${item.cover}" alt="${item.title}">
          <div class="movie-badge">${item.year}</div>
        </div>
        <div class="movie-body">
          <h3 class="movie-title">${item.title}</h3>
          <div class="movie-meta">
            <span>${item.region}</span>
            <span>${item.genre.split(/[\/／、,，]/)[0]}</span>
          </div>
          <p class="movie-desc">${item.one_line || item.summary}</p>
        </div>
      </a>`;
    return html;
  }

  function render(list) {
    grid.innerHTML = list.map(card).join('');
    count.textContent = `共 ${list.length.toLocaleString()} 部影片`;
  }

  function match(item, q) {
    if (!q) return true;
    const hay = `${item.title} ${item.keywords} ${item.summary}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every(tok => hay.includes(tok));
  }

  function apply() {
    const q = input.value.trim();
    const filtered = window.CATALOG.filter(item => match(item, q))
      .filter(item => !genre || item.genre.includes(genre))
      .sort((a, b) => b.score - a.score)
      .slice(0, 300);
    render(filtered);
  }

  chips.forEach(chip => chip.addEventListener('click', () => {
    const g = chip.dataset.genre || '';
    params.set('genre', g);
    history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
    chips.forEach(c => c.classList.toggle('is-active', c === chip));
    apply();
  }));

  input.addEventListener('input', apply);
  apply();
});
