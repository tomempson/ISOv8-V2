document.addEventListener('DOMContentLoaded', () => {
  // Clean up any lingering transition panels (e.g., when returning via bfcache)
  function cleanupTransitionPanels() {
    try {
      const panels = document.querySelectorAll('.page-transition-panel');
      panels.forEach(p => p.remove());
    } catch (_) {}
  }

  // Grab core elements first and bail out early on pages without the sidebar (e.g., sub pages)
  const asideEl = document.querySelector('aside');
  const overlay = document.getElementById('sidebar-overlay');
  const sidebarCategoriesSection = document.getElementById('sidebar-navigation-categories');
  const subCategoryContainer = document.getElementById('sidebar-navigation-sub-categories');
  if (!asideEl || !sidebarCategoriesSection || !subCategoryContainer) {
    // Still clean any stray transition panels if present, then no-op
    cleanupTransitionPanels();
    return;
  }

  const categoryLinks = document.querySelectorAll(
    '#sidebar-navigation-categories .sidebar-navigation-text'
  );
  const subCategoryGroups = subCategoryContainer.querySelectorAll('.sidebar-flexbox');
  const openSidebarBtn = document.querySelector('.hamburger-menu-button');
  const closeSidebarBtn = document.querySelector('.sidebar-close-button');
  const heroFlexbox = document.querySelector('.hero-flexbox');
  let onSubCloseCallback = null; // queued opener after a close finishes
  let subCloseFinalized = false;   // idempotent guard for close finalize
  let subCloseTimer = null;        // timeout fallback for transform end

  // If we set a restore flag before navigating away, rebuild the "both open" state on return (via Back/Forward)
  const RESTORE_KEY = 'ISOv8_restore_both_open';
  const RESTORE_SLUG_KEY = 'ISOv8_restore_slug';
  const SUB_ACTIVE_KEY = 'ISOv8_sub_active_text';

  const normaliseLabel = (s) => (s || '').replace(/\s+/g, ' ').trim();
  // Helper to restore the "both open" state immediately (DOM ready) or on pageshow
  let restoredOnLoad = false;
  function restoreBothOpenIfRequested() {
    cleanupTransitionPanels();
    if (overlay) overlay.style.zIndex = '99999';
    if (sessionStorage.getItem(RESTORE_KEY) !== '1') return false;

    sessionStorage.removeItem(RESTORE_KEY);
    const slug = sessionStorage.getItem(RESTORE_SLUG_KEY);
    if (slug) sessionStorage.removeItem(RESTORE_SLUG_KEY);

    // Re-open the sidebar with both panels visible; start animation immediately
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    heroFlexbox.style.position = 'fixed';

    overlay.style.display = 'block';
    overlay.style.opacity = '0';

    asideEl.style.display = 'flex';
    // Force starting position off-screen, then animate in on next frame
    asideEl.style.transform = 'translateX(-100%)';

    sidebarCategoriesSection.style.display = 'block';
    subCategoryContainer.style.display = 'flex';
    subCategoryContainer.style.overflowY = 'auto';

    // Ensure a clean, fully-open sub panel state with only one group visible
    subCategoryContainer.classList.remove('reveal-band');
    subCategoryContainer.classList.add('reveal-open');
    subCategoryContainer.style.clipPath = 'none';
    subCategoryContainer.style.webkitClipPath = 'none';
    hideAllSubCategories();

    // Decide which sub group to show
    let slugToShow = slug;
    if (!slugToShow) {
      const activeCat = sidebarCategoriesSection.querySelector('.sidebar-navigation-text.active');
      if (activeCat) slugToShow = slugify(activeCat.textContent);
      else if (categoryLinks.length) slugToShow = slugify(categoryLinks[0].textContent);
    }

    if (slugToShow) {
      categoryLinks.forEach(l => {
        if (slugify(l.textContent) === slugToShow) l.classList.add('active');
        else l.classList.remove('active');
      });
      const target = subCategoryContainer.querySelector(`.${slugToShow}`);
      if (target) {
        target.style.display = 'block';
        // Apply stored active state for sub links, if any
        try {
          const stored = sessionStorage.getItem(SUB_ACTIVE_KEY);
          if (stored) {
            const links = target.querySelectorAll('.sidebar-sub-navigation-text');
            links.forEach(l => l.classList.remove('active'));
            const match = Array.from(links).find(l => normaliseLabel(l.textContent) === normaliseLabel(stored));
            if (match) match.classList.add('active');
          }
        } catch (_) {}
      }
    }

    // Kick off the visible animation on the next frame
    requestAnimationFrame(() => {
      void asideEl.offsetWidth; // reflow
      asideEl.style.transform = 'translateX(0)';
      overlay.style.opacity = '1';
      sidebarCategoriesSection.style.transform = 'translateX(0)';
      subCategoryContainer.style.transform = 'translateX(0)';
    });
    restoredOnLoad = true;
    return true;
  }

  // Run on pageshow (bfcache restore) and as a fallback
  window.addEventListener('pageshow', restoreBothOpenIfRequested);

  // Initial cleanup in case DOMContentLoaded fires from a cached state
  cleanupTransitionPanels();
  // If we set restore flags before navigating away, restore immediately on DOM ready
  restoreBothOpenIfRequested();

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

  // Helper: wait for a transition on specific properties (with timeout fallback)
  function waitForTransition(el, props, timeoutMs, cb) {
    let done = false;
    const wanted = Array.isArray(props) ? props : [props];
    const handler = (e) => {
      if (!wanted.includes(e.propertyName)) return;
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', handler);
      if (timer) clearTimeout(timer);
      cb();
    };
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', handler);
      cb();
    }, timeoutMs || 800);
    el.addEventListener('transitionend', handler);
  }

  function finalizeSubClose() {
    if (subCloseFinalized) return;
    subCloseFinalized = true;
    if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null; }

    subCategoryContainer.classList.remove('closing');
    // Clear any inline transitions and clip-path so future opens are clean
    subCategoryContainer.style.transition = '';
    subCategoryContainer.style.clipPath = 'none';
    subCategoryContainer.style.webkitClipPath = 'none';
    subCategoryContainer.style.display = 'none';
    hideAllSubCategories();
    subCategoryContainer.classList.remove('reveal-band', 'reveal-open');

    // If an opener has been queued, run it on next frame
    const cb = onSubCloseCallback;
    onSubCloseCallback = null;
    if (typeof cb === 'function') {
      requestAnimationFrame(cb);
    }

    subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
  }

  function handleSubCategoriesTransitionEnd(e) {
    if (e.propertyName === 'transform') {
      finalizeSubClose();
    }
  }

  const openSidebar = () => {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    heroFlexbox.style.position = 'fixed';
    overlay.style.display = 'block';
    // Reset overlay layering for normal sidebar usage
    overlay.style.zIndex = '99999';
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
      // Prepare target slug and element
      const slug = slugify(link.textContent);
      const target = subCategoryContainer.querySelector(`.${slug}`);
      if (!target) {
        console.warn(`No sub-category block found for "${slug}"`);
        return;
      }
      

      // Define the full two-stage OPEN sequence for this link
      const doOpen = () => {
        subCategoryContainer.classList.remove('closing');
        subCategoryContainer.removeEventListener('transitionend', handleSubCategoriesTransitionEnd);
        categoryLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        hideAllSubCategories();
        target.style.display = 'block';

        // Reset any inline styles from the previous open so the new two-stage animation plays
        subCategoryContainer.style.clipPath = '';
        subCategoryContainer.style.webkitClipPath = '';
        subCategoryContainer.style.overflowY = '';
        subCategoryContainer.style.transition = '';

        // Position the 40px band at the clicked item's center within the aside viewport
        const asideRect = asideEl.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        let bandY = linkRect.top + linkRect.height / 2 - asideRect.top;
        const minBand = 20;
        const maxBand = asideRect.height - 20;
        bandY = Math.max(minBand, Math.min(maxBand, bandY));
        subCategoryContainer.style.setProperty('--band-y', bandY + 'px');

        // Stage 1: thin band + horizontal slide in
        subCategoryContainer.classList.remove('reveal-open');
        subCategoryContainer.classList.add('reveal-band');
        subCategoryContainer.style.display = 'flex';
        subCategoryContainer.style.transform = 'translateX(-100%)';
        void subCategoryContainer.offsetWidth; // reflow
        subCategoryContainer.style.transform = 'translateX(0)';

        // Stage 2: after slide-in, vertically reveal
        const onSlideInEnd = (e) => {
          if (e.propertyName !== 'transform') return;
          subCategoryContainer.removeEventListener('transitionend', onSlideInEnd);
          subCategoryContainer.classList.remove('reveal-band');
          subCategoryContainer.classList.add('reveal-open');
          subCategoryContainer.style.overflowY = 'auto';
          const onRevealEnd = (ev) => {
            if (ev.propertyName !== 'clip-path' && ev.propertyName !== '-webkit-clip-path') return;
            subCategoryContainer.removeEventListener('transitionend', onRevealEnd);
            subCategoryContainer.style.clipPath = 'none';
            subCategoryContainer.style.webkitClipPath = 'none';
          };
          subCategoryContainer.addEventListener('transitionend', onRevealEnd);
        };
        subCategoryContainer.addEventListener('transitionend', onSlideInEnd);
      };

      const isVisible = getComputedStyle(subCategoryContainer).display !== 'none';
      const isClosing = subCategoryContainer.classList.contains('closing');

      if (isClosing) {
        // Queue this open to start as soon as the current close finishes
        onSubCloseCallback = doOpen;
        return;
      }

      if (isVisible) {
        // Close the current one first, then open the requested one
        closeSubCategories(doOpen);
      } else {
        // Nothing open; just run the open animation
        doOpen();
      }
    });
  });

  
  
  const subNavLinks = document.querySelectorAll('#sidebar-navigation-sub-categories .sidebar-sub-navigation-text');

  const TRANSITION_SECONDS = 0.9; 

  // Create a left-to-right sliding panel that displays the target page (via iframe)
  function createTransitionPanel(startLeftPx, targetHref) {
    const panel = document.createElement('div');
    panel.className = 'page-transition-panel';
    // Size and position so it appears from behind the sub-category column
    const left = Math.max(0, Math.floor(startLeftPx));
    panel.style.left = left + 'px';
    panel.style.width = Math.max(0, window.innerWidth - left) + 'px';
    panel.style.height = '100dvh';
    panel.style.transform = 'translateX(-100%)';
    panel.style.transition = `transform ${TRANSITION_SECONDS}s ease`;
    // Below <aside> (100000), above overlay (99999), above main.
    panel.style.zIndex = '99999';
    panel.style.background = 'white';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.overflow = 'hidden';
    panel.style.pointerEvents = 'none';

    const iframe = document.createElement('iframe');
    iframe.src = targetHref;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    panel.appendChild(iframe);

    document.body.appendChild(panel);

    // Kick off the slide-in on the next frame
    requestAnimationFrame(() => {
      // Force reflow to ensure the starting transform is applied
      void panel.offsetWidth;
      panel.style.transform = 'translateX(0)';
    });

    return panel;
  }

  subNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHref = link.getAttribute('href');

      // Visually mark this link active immediately and persist the choice
      try {
        const label = normaliseLabel(link.textContent);
        sessionStorage.setItem(SUB_ACTIVE_KEY, label);
      } catch (_) {}
      subNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // We'll calculate the origin left after the sidebar finishes collapsing
      let panelEl = null;

      const onCategoriesEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        sidebarCategoriesSection.removeEventListener('transitionend', onCategoriesEnd);

        // Record a request to restore "both open" state when this page is shown again (e.g., user taps Back)
        try {
          sessionStorage.setItem(RESTORE_KEY, '1');
          const activeCat = sidebarCategoriesSection.querySelector('.sidebar-navigation-text.active');
          if (activeCat) {
            const slug = slugify(activeCat.textContent);
            sessionStorage.setItem(RESTORE_SLUG_KEY, slug);
          }
        } catch (_) {}

        // After collapse, use the now-current left edge of the sub-categories
        // area (typically 0) so the panel feels like it emerges from that edge.
        const subNow = subCategoryContainer.getBoundingClientRect();
        const startLeftNow = subNow.left;
        // Create and run the reveal panel, then navigate after its slide finishes
        panelEl = createTransitionPanel(startLeftNow, targetHref);
        const onPanelEnd = (pe) => {
          if (pe.propertyName !== 'transform') return;
          panelEl.removeEventListener('transitionend', onPanelEnd);
      // Follow the link once the panel fully slides in
      window.location.href = targetHref;
        };
        panelEl.addEventListener('transitionend', onPanelEnd);
      };

      // Ensure overlay sits behind the slide panel during the reveal
      if (overlay) overlay.style.zIndex = '99998';

      // Start the sidebar collapse (categories + sub-categories shift left by the categories width)
      sidebarCategoriesSection.addEventListener('transitionend', onCategoriesEnd);
      sidebarCategoriesSection.style.display = 'block';
      subCategoryContainer.style.display = 'flex';
      const catWidth = sidebarCategoriesSection.getBoundingClientRect().width;
      sidebarCategoriesSection.style.transform = 'translateX(0px)';
      subCategoryContainer.style.transform = 'translateX(0px)';
      sidebarCategoriesSection.style.transition = `transform ${TRANSITION_SECONDS}s`;
      subCategoryContainer.style.transition = `transform ${TRANSITION_SECONDS}s`;
      void sidebarCategoriesSection.offsetWidth;
      void subCategoryContainer.offsetWidth;
      // Keep the dim overlay visible during the slide.
      sidebarCategoriesSection.style.transform = `translateX(-${catWidth}px)`;
      subCategoryContainer.style.transform = `translateX(-${catWidth}px)`;
    });
  });

  const returnButtons = document.querySelectorAll('.sidebar-return-button');
  const closeSubCategories = (afterClose) => {
    subCloseFinalized = false;
    if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null; }
    // If a callback function is provided, queue it to run after the close completes
    onSubCloseCallback = (typeof afterClose === 'function') ? afterClose : null;

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
    void subCategoryContainer.offsetWidth; // reflow
    subCategoryContainer.classList.remove('reveal-open');
    subCategoryContainer.classList.add('reveal-band');

    // Wait for the vertical collapse (clip-path) to finish, then slide out left
    waitForTransition(
      subCategoryContainer,
      ['clip-path', '-webkit-clip-path'],
      800,
      () => {
        // Stage B: slide out to the left (animate transform)
        subCategoryContainer.style.transition = 'transform 0.9s ease';
        subCategoryContainer.addEventListener('transitionend', handleSubCategoriesTransitionEnd);
        // force reflow to apply the new transition before changing transform
        void subCategoryContainer.offsetWidth;
        subCategoryContainer.style.transform = 'translateX(-100%)';
        // Fallback: if the transform transitionend is missed, finalize anyway
        subCloseTimer = setTimeout(finalizeSubClose, 950);
      }
    );
  };
  returnButtons.forEach(btn => btn.addEventListener('click', () => closeSubCategories()));

  hideAllSubCategories();

  // Only hide initial panels if we didn't just restore the "both open" state
  if (!restoredOnLoad) {
    asideEl.style.display = 'none';
    sidebarCategoriesSection.style.display = 'none';
    subCategoryContainer.style.display = 'none';
  }
});
