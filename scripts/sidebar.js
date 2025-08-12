document.addEventListener('DOMContentLoaded', () => {
  const categoryLinks = document.querySelectorAll(
    '#sidebar-navigation-categories .sidebar-navigation-text'
  );

  const subCategoryContainer = document.getElementById(
    'sidebar-navigation-sub-categories'
  );

  const subCategoryGroups =
    subCategoryContainer.querySelectorAll('.sidebar-flexbox');

  const openSidebarBtn = document.querySelector('.hamburger-menu-button');
  const closeSidebarBtn = document.querySelector('.sidebar-close-button');
  const sidebarCategoriesSection = document.getElementById('sidebar-navigation-categories');
  const asideEl = document.querySelector('aside');
  const overlay = document.getElementById('sidebar-overlay');
  const heroFlexbox = document.querySelector('.hero-flexbox');

  const slugify = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

  const hideAllSubCategories = () => {
    subCategoryGroups.forEach((el) => {
      el.style.display = 'none';
    });
  };

  function handleSubCategoriesTransitionEnd(e) {
    if (e.propertyName === 'transform') {
      subCategoryContainer.style.display = 'none';
      hideAllSubCategories();
      subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
    }
  }

  const openSidebar = () => {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    heroFlexbox.style.position = 'fixed';
    overlay.style.display = 'block';
    overlay.style.opacity = '0';
    asideEl.style.display = 'flex';
    sidebarCategoriesSection.style.display = 'block';
    subCategoryContainer.style.display = 'none';
    hideAllSubCategories();
    requestAnimationFrame(() => {
      asideEl.style.transform = 'translateX(0)';
      overlay.style.opacity = '1';
    });
  };

  const closeSidebar = (afterClose) => {
    asideEl.style.transform = 'translateX(-100%)';
    overlay.style.opacity = '0';
    asideEl.addEventListener('transitionend', function handler() {
      categoryLinks.forEach(l => l.classList.remove('active'));
      heroFlexbox.style.position = 'absolute';
      document.body.style.position = '';
      document.body.style.width = '';
      sidebarCategoriesSection.style.display = 'none';
      subCategoryContainer.style.display = 'none';
      hideAllSubCategories();
      asideEl.style.display = 'none';
      asideEl.removeEventListener('transitionend', handler);
      if (typeof afterClose === 'function') {
        afterClose();
      }
    });
    overlay.addEventListener('transitionend', function overlayHandler(e) {
      if (e.propertyName === 'opacity') {
        overlay.style.display = 'none';
        overlay.removeEventListener('transitionend', overlayHandler);
      }
    });
  };

  if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', openSidebar);
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => closeSidebar());
  }

  categoryLinks.forEach((link) => {
    link.addEventListener('click', () => {
      subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
      categoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const slug = slugify(link.textContent);

      const target = subCategoryContainer.querySelector(`.${slug}`);
      if (!target) {
        console.warn(`No sub‑category block found for "${slug}"`);
        return;
      }

      subCategoryContainer.style.transform = 'translateX(-100%)';
      subCategoryContainer.style.display = 'flex';
      requestAnimationFrame(() => {
        subCategoryContainer.style.transform = 'translateX(0)';
      });

      hideAllSubCategories();
      target.style.display = 'block';
    });
  });

  // Intercept sub-navigation link clicks so categories slide left by their full width
  // while sub-categories stick to them and end flush against the left edge. Then navigate.
  const subNavLinks = document.querySelectorAll('#sidebar-navigation-sub-categories .sidebar-sub-navigation-text');

  const TRANSITION_SECONDS = 0.9; // match CSS timing

  subNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHref = link.getAttribute('href');

      // Ensure both sections are visible for the animation
      sidebarCategoriesSection.style.display = 'block';
      subCategoryContainer.style.display = 'flex';

      // How far to move: exactly the width of the categories panel
      const catWidth = sidebarCategoriesSection.getBoundingClientRect().width;

      // Explicit starting state so we animate from 0 → -catWidth
      sidebarCategoriesSection.style.transform = 'translateX(0px)';
      subCategoryContainer.style.transform = 'translateX(0px)';

      // Apply transitions to both panes
      sidebarCategoriesSection.style.transition = `transform ${TRANSITION_SECONDS}s`;
      subCategoryContainer.style.transition = `transform ${TRANSITION_SECONDS}s`;

      // Force reflow to ensure transitions take effect
      void sidebarCategoriesSection.offsetWidth;
      void subCategoryContainer.offsetWidth;

      // Animate: both shift left by the categories width. This keeps the
      // sub-categories panel "stuck" to the categories until categories are off-screen,
      // leaving sub-categories flush against the left page edge.
      sidebarCategoriesSection.style.transform = `translateX(-${catWidth}px)`;
      subCategoryContainer.style.transform = `translateX(-${catWidth}px)`;

      // After categories finish sliding, navigate
      const onCategoriesEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        sidebarCategoriesSection.removeEventListener('transitionend', onCategoriesEnd);
        // Clean up inline transitions for future interactions
        sidebarCategoriesSection.style.transition = '';
        subCategoryContainer.style.transition = '';
        window.location.href = targetHref;
      };
      sidebarCategoriesSection.addEventListener('transitionend', onCategoriesEnd);
    });
  });

  const returnButtons = document.querySelectorAll('.sidebar-return-button');
  const closeSubCategories = () => {
    categoryLinks.forEach(l => l.classList.remove('active'));
    subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
    subCategoryContainer.style.transform = 'translateX(-100%)';
    subCategoryContainer.addEventListener('transitionend', handleSubCategoriesTransitionEnd);
  };
  returnButtons.forEach(btn => btn.addEventListener('click', closeSubCategories));

  hideAllSubCategories();

  asideEl.style.display = 'none';
  sidebarCategoriesSection.style.display = 'none';
  subCategoryContainer.style.display = 'none';
});