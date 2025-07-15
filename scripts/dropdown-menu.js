document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger-menu');
  const dropdown  = document.getElementById('dropdown-menu');
  const headerFlex = document.querySelector('.header-flexbox');
  const headerLogo = document.querySelector('.header-logo');
  const heroFlex = document.querySelector('.hero-flexbox');

  if (hamburger && dropdown) {
    hamburger.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      headerFlex && headerFlex.classList.toggle('menu-open');
      if (heroFlex) {
        heroFlex.style.top = dropdown.classList.contains('open') ? '350px' : '105px';
        heroFlex.style.bottom = dropdown.classList.contains('open') ? '-203px' : '0';
      }
      if (headerLogo) {
        if (dropdown.classList.contains('open')) {
          if (!headerLogo.dataset.originalSrc) {
            headerLogo.dataset.originalSrc = headerLogo.src;
          }
          headerLogo.src = 'graphics/isov8-logo-colour.svg';
        } else if (headerLogo.dataset.originalSrc) {
          headerLogo.src = headerLogo.dataset.originalSrc;
        }
      }
    });
  }

  /* -----------------------------------------------------------
     Show the matching sub‑menu when a top‑level button is hovered
  ----------------------------------------------------------- */
  const navButtons   = document.querySelectorAll('.dropdown-menu-navigation-buttons');
  const subContainers = document.querySelectorAll('.dropdown-menu-navigation-sub-categories-container');

  navButtons.forEach((button, index) => {
    const target = subContainers[index];
    if (!target) return;                // safety: skip if no match

    // Show the relevant sub‑menu on hover
    button.addEventListener('mouseenter', () => {
      subContainers.forEach(c => c.style.opacity = 0);
      target.style.opacity = 1;
    });

    // Hide the sub‑menu when leaving the button
    button.addEventListener('mouseleave', () => {
      target.style.opacity = 0;
    });

    // Also hide the sub‑menu when the pointer exits it
    target.addEventListener('mouseleave', () => {
      target.style.opacity = 0;
    });
  });
});
