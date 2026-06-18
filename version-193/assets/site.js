
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open') ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero-slide')];
    const dots = [...hero.querySelectorAll('[data-hero-dot]')];
    if (slides.length > 1) {
      let index = 0;
      const activate = (i) => {
        slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
        dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      };
      activate(0);
      let timer = setInterval(() => {
        index = (index + 1) % slides.length;
        activate(index);
      }, 4500);
      hero.addEventListener('mouseenter', () => clearInterval(timer));
      hero.addEventListener('mouseleave', () => {
        timer = setInterval(() => {
          index = (index + 1) % slides.length;
          activate(index);
        }, 4500);
      });
      dots.forEach((dot, idx) => dot.addEventListener('click', () => {
        index = idx;
        activate(index);
      }));
    }
  }
});
