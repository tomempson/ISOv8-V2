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
      subCategoryContainer.classList.remove('closing');
      // Clear any inline transitions and clip-path so future opens are clean
      subCategoryContainer.style.transition = '';
      subCategoryContainer.style.clipPath = 'none';
      subCategoryContainer.style.webkitClipPath = 'none';
      subCategoryContainer.style.display = 'none';
      hideAllSubCategories();
      subCategoryContainer.classList.remove('reveal-band', 'reveal-open');
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
      subCategoryContainer.classList.remove('closing');
      subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
      categoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const slug = slugify(link.textContent);

      const target = subCategoryContainer.querySelector(`.${slug}`);
      if (!target) {
        console.warn(`No sub-category block found for "${slug}"`);
        return;
      }

      
      hideAllSubCategories();
      target.style.display = 'block';

      // Reset any inline styles from the previous open so the new two-stage animation plays
      subCategoryContainer.style.clipPath = '';
      subCategoryContainer.style.webkitClipPath = '';
      subCategoryContainer.style.overflowY = '';
      subCategoryContainer.style.transition = '';

      const asideRect = asideEl.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      let bandY = linkRect.top + linkRect.height / 2 - asideRect.top; 
      const minBand = 20;
      const maxBand = asideRect.height - 20;
      bandY = Math.max(minBand, Math.min(maxBand, bandY));
      subCategoryContainer.style.setProperty('--band-y', bandY + 'px');

      
      subCategoryContainer.classList.remove('reveal-open');
      subCategoryContainer.classList.add('reveal-band');

      
      subCategoryContainer.style.display = 'flex';
      subCategoryContainer.style.transform = 'translateX(-100%)';
      void subCategoryContainer.offsetWidth; 
      subCategoryContainer.style.transform = 'translateX(0)';

      
      const onSlideInEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        subCategoryContainer.removeEventListener('transitionend', onSlideInEnd);
        subCategoryContainer.classList.remove('reveal-band');
        subCategoryContainer.classList.add('reveal-open');
        // ensure the scroll container is active right away
        subCategoryContainer.style.overflowY = 'auto';
        // when the clip-path transition on the container finishes, clear it entirely
        const onRevealEnd = (ev) => {
          if (ev.propertyName !== 'clip-path' && ev.propertyName !== 'webkit-clip-path') return;
          subCategoryContainer.removeEventListener('transitionend', onRevealEnd);
          subCategoryContainer.style.clipPath = 'none';
          subCategoryContainer.style.webkitClipPath = 'none';
        };
        subCategoryContainer.addEventListener('transitionend', onRevealEnd);
      };
      subCategoryContainer.addEventListener('transitionend', onSlideInEnd);
    });
  });

  
  
  const subNavLinks = document.querySelectorAll('#sidebar-navigation-sub-categories .sidebar-sub-navigation-text');

  const TRANSITION_SECONDS = 0.9; 

  subNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHref = link.getAttribute('href');

      
      sidebarCategoriesSection.style.display = 'block';
      subCategoryContainer.style.display = 'flex';

      
      const catWidth = sidebarCategoriesSection.getBoundingClientRect().width;

      
      sidebarCategoriesSection.style.transform = 'translateX(0px)';
      subCategoryContainer.style.transform = 'translateX(0px)';

      
      sidebarCategoriesSection.style.transition = `transform ${TRANSITION_SECONDS}s`;
      subCategoryContainer.style.transition = `transform ${TRANSITION_SECONDS}s`;

      
      void sidebarCategoriesSection.offsetWidth;
      void subCategoryContainer.offsetWidth;

      
      
      
      sidebarCategoriesSection.style.transform = `translateX(-${catWidth}px)`;
      subCategoryContainer.style.transform = `translateX(-${catWidth}px)`;

      
      const onCategoriesEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        sidebarCategoriesSection.removeEventListener('transitionend', onCategoriesEnd);
        
        sidebarCategoriesSection.style.transition = '';
        subCategoryContainer.style.transition = '';
        window.location.href = targetHref;
      };
      sidebarCategoriesSection.addEventListener('transitionend', onCategoriesEnd);
    });
  });

  const returnButtons = document.querySelectorAll('.sidebar-return-button');
  const closeSubCategories = () => {
    subCategoryContainer.classList.add('closing');
    categoryLinks.forEach(l => l.classList.remove('active'));

    // Ensure container is visible and at the on-screen position to start the reverse animation
    subCategoryContainer.style.display = 'flex';
    subCategoryContainer.style.transform = 'translateX(0)';

    // IMPORTANT: clear any inline clip-path from a previous open so the collapse can animate
    subCategoryContainer.style.clipPath = '';
    subCategoryContainer.style.webkitClipPath = '';

    // Ensure we start from fully open state
    subCategoryContainer.classList.remove('reveal-band');
    subCategoryContainer.classList.add('reveal-open');

    // Stage A: collapse vertically back to the 40px band at the stored --band-y
    subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
    subCategoryContainer.style.transition = 'clip-path 0.6s ease';
    // force reflow then switch to band state to animate the clip-path
    void subCategoryContainer.offsetWidth;
    subCategoryContainer.classList.remove('reveal-open');
    subCategoryContainer.classList.add('reveal-band');

    const onCollapseEnd = (ev) => {
      if (ev.propertyName !== 'clip-path' && ev.propertyName !== 'webkit-clip-path') return;
      subCategoryContainer.removeEventListener('transitionend', onCollapseEnd);

      // Stage B: slide out to the left (animate transform)
      subCategoryContainer.style.transition = 'transform 0.9s ease';
      subCategoryContainer.addEventListener('transitionend', handleSubCategoriesTransitionEnd);
      // force reflow to apply the new transition before changing transform
      void subCategoryContainer.offsetWidth;
      subCategoryContainer.style.transform = 'translateX(-100%)';
    };
    subCategoryContainer.addEventListener('transitionend', onCollapseEnd);
  };
  returnButtons.forEach(btn => btn.addEventListener('click', closeSubCategories));

  hideAllSubCategories();

  asideEl.style.display = 'none';
  sidebarCategoriesSection.style.display = 'none';
  subCategoryContainer.style.display = 'none';
});