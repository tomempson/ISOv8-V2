function updateHeaderLogo() {
  const logo = document.querySelector('.header-logo');
  if (!logo) return;

  if (window.innerWidth <= 550) {
    logo.src = 'graphics/isov8-logo-mark.svg';
  } else {
    logo.src = 'graphics/isov8-logo.svg';
  }
}

window.addEventListener('load', updateHeaderLogo);
window.addEventListener('resize', updateHeaderLogo);