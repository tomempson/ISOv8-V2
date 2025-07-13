document.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.querySelector('.sidebar-close-button');

  if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener('click', () => {
      sidebar.style.display = 'flex';
      requestAnimationFrame(() => {
        sidebar.classList.add('visible');
      });

      document.body.style.overflow = 'hidden';
    });
  }

  if (closeButton && sidebar) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('visible');
      
      setTimeout(() => {
        sidebar.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    });
  }
});

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

function slideBackToMainNavigation() {
  const navAll = document.querySelector('.navigation-all');
  const navSubCatagory = document.querySelector('.navigation-sub-catagory');

  navAll.style.display = 'flex';
  navAll.style.transform = 'translateX(100vw)';

  requestAnimationFrame(() => {
    navAll.style.transition = 'transform 0.25s ease-in-out';
    navAll.style.transform = 'translateX(0)';
  });

  navSubCatagory.style.transition = 'transform 0.25s ease-in-out';
  navSubCatagory.style.transform = 'translateX(-100vw)';

  navSubCatagory.addEventListener('transitionend', function handleBackTransition() {
    navSubCatagory.style.display = 'none';
    navSubCatagory.removeEventListener('transitionend', handleBackTransition);
  });
}

function slideNavigationMenu(clickedElement) {
  const navAll = document.querySelector('.navigation-all');
  const navSubCatagory = document.querySelector('.navigation-sub-catagory');

  navAll.style.transition = 'transform 0.25s ease-in-out';
  navAll.style.transform = 'translateX(100vw)';

  navSubCatagory.style.display = 'flex';
  navSubCatagory.style.transform = 'translateX(-100vw)';

  requestAnimationFrame(() => {
    navSubCatagory.style.transition = 'transform 0.25s ease-in-out';
    navSubCatagory.style.transform = 'translateX(0)';
  });

  navAll.addEventListener('transitionend', function handleTransitionEnd() {
    navAll.style.display = 'none';
    navAll.removeEventListener('transitionend', handleTransitionEnd);
  });

  const clickedText = clickedElement?.textContent?.trim().toLowerCase();

  document.querySelectorAll('.navigation-sub-catagory > div').forEach(div => {
    div.classList.remove('active');
  });

  const slug = clickedText.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const targetSelector = `.sidebar-sub-catagory-${slug}`;
  const targetSubCat = document.querySelector(targetSelector);

  if (targetSubCat) {
    targetSubCat.classList.add('active');
  }
}