const refs = {
  openMenu: document.querySelector('[data-menu-open]'),
  closeMenu: document.querySelector('[data-menu-close]'),
  body: document.querySelector('body'),
  menu: document.querySelector('[data-menu]'),
};

refs.openMenu.addEventListener('click', openMenu);
refs.closeMenu.addEventListener('click', closeMenu);

function openMenu() {
  refs.menu.classList.add('is-open');
}

function closeMenu(e) {
  if (e.target === refs.closeMenu) {
    refs.menu.classList.remove('is-open');
  }
}

window.matchMedia('(min-width: 768px)').addEventListener('change', e => {
  if (!e.matches) {
    return;
  }
  refs.menu.classList.remove('is-open');
});
