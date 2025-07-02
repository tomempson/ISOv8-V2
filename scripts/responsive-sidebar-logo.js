  function updateSidebarLogo() {
    const logo = document.querySelector('.sidebar-logo');
    if (!logo) return;

    if (window.innerWidth <= 550) {
      logo.src = 'graphics/isov8-logo-mark.svg';
    } else {
      logo.src = 'graphics/isov8-logo.svg'; // <-- replace with your default/full-size logo
    }
  }

  // Run on page load
  window.addEventListener('load', updateSidebarLogo);

  // Run on resize
  window.addEventListener('resize', updateSidebarLogo);