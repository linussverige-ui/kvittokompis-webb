/* Small progressive enhancement for the mobile menu; no analytics or remote requests. */
(() => {
  const menu = document.querySelector('.landing-mobile-nav');
  if (!menu) return;
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.open = false;
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menu.open = false;
  });
  document.addEventListener('pointerdown', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
})();
