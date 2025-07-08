  function updateSidebarLogo() {
    const logo = document.querySelector('.sidebar-logo');
    if (!logo) return;

    if (window.innerWidth <= 550) {
      logo.src = 'graphics/isov8-logo-mark-colour.svg';
    } else {
      logo.src = 'graphics/isov8-logo-colour.svg'; 
    }
  }

  window.addEventListener('load', updateSidebarLogo);

  window.addEventListener('resize', updateSidebarLogo);