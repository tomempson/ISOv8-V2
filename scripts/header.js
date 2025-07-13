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

  // Smart sticky header behaviour
  window.addEventListener('load', () => {
    let lastScrollY = window.scrollY;
    const headerEl = document.querySelector('header');
    if (!headerEl) return;

    function handleSmartHeader() {
      const current = window.scrollY;

      // Slide header up when scrolling down, bring it back on scroll up
      if (current > lastScrollY && current > 100) {
        headerEl.classList.add('header-hidden');
      } else {
        headerEl.classList.remove('header-hidden');
      }

      // Switch background for contrast after 50 px
      if (current > 50) {
        headerEl.classList.add('header-scrolled');
      } else {
        headerEl.classList.remove('header-scrolled');
      }

      lastScrollY = current;
    }

    window.addEventListener('scroll', handleSmartHeader, { passive: true });
  });