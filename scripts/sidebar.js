document.addEventListener('DOMContentLoaded', () => {
  // Remove any lingering transition panels/iframes when this page loads/restores
  function cleanupTransitionPanels() {
    try {
      document.querySelectorAll('.page-transition-panel').forEach((p) => {
        try {
          if (p && p.getAttribute('data-persistent') === 'true') return;
          p.remove();
        } catch (_) {}
      });
    } catch (_) {}
  }
  cleanupTransitionPanels();

  // If a sub-page captured its content before navigating back, retrieve it
  let returnFramePayload = null;
  try {
    const raw = sessionStorage.getItem('ISOv8__returnFrameHTML');
    if (raw) returnFramePayload = JSON.parse(raw);
  } catch (_) {
    returnFramePayload = null;
  }
  let returnPagePath = null;
  try {
    returnPagePath = sessionStorage.getItem('ISOv8__returnPagePath') || null;
  } catch (_) {
    returnPagePath = null;
  }

  // If we arrived here via a sidebar return anchor, show categories
  let showCategoriesOnLoad = false;
  try {
    showCategoriesOnLoad = sessionStorage.getItem('ISOv8__returnShowCategories') === '1';
  } catch (_) {
    // Ignore storage access failures
  }

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
  let onSubCloseCallback = null; // queued opener after a close finishes
  let subCloseFinalized = false;   // idempotent guard for close finalize
  let subCloseTimer = null;        // timeout fallback for transform end

  // Persist the last clicked sub-link for styling only
  const SUB_ACTIVE_KEY = 'ISOv8_sub_active_text';

  const normaliseLabel = (s) => (s || '').replace(/\s+/g, ' ').trim();
  // On BFCache return, just cleanup any leftover transition panels
  window.addEventListener('pageshow', () => {
    cleanupTransitionPanels();
  });

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

  // Determine if we're on the home page (index)
  const isHomePage = (() => {
    try {
      const p = window.location && typeof window.location.pathname === 'string'
        ? window.location.pathname
        : '';
      return p === '/' || /\/index\.html?$/.test(p) || /\/$/.test(p);
    } catch (_) {
      return false;
    }
  })();

  if (isHomePage) {
    // Reset any stored/visual active state for sub-menu on the home page
    try { sessionStorage.removeItem(SUB_ACTIVE_KEY); } catch (_) {}
    if (subNavLinks && subNavLinks.length) {
      subNavLinks.forEach((l) => l.classList.remove('active'));
    }
  } else {
    // On non-home pages, restore the previously active sub-link (if any)
    try {
      const storedActive = sessionStorage.getItem(SUB_ACTIVE_KEY);
      if (storedActive && subNavLinks && subNavLinks.length) {
        subNavLinks.forEach((l) => l.classList.remove('active'));
        subNavLinks.forEach((l) => {
          try {
            if (normaliseLabel(l.textContent) === storedActive) {
              l.classList.add('active');
            }
          } catch (_) {}
        });
      }
    } catch (_) {
      // Ignore storage access failures
    }
  }

  const TRANSITION_SECONDS = 0.9; 
  // Slower duration specifically for the outgoing return iframe panel
  const RETURN_PANEL_SECONDS = 1.6;

  // Create a left-to-right sliding panel that displays the target page (via iframe)
  function createTransitionPanel(startLeftPx, targetHref) {
    const panel = document.createElement('div');
    panel.className = 'page-transition-panel';
    panel.setAttribute('data-persistent', 'true');
    // Size and position so it appears from behind the sub-category column
    const left = Math.max(0, Math.floor(startLeftPx));
    panel.style.left = left + 'px';
    panel.style.width = Math.max(0, window.innerWidth - left) + 'px';
    panel.style.height = '100dvh';
    panel.style.transform = 'translateX(-100%)';
    panel.style.transition = `transform ${TRANSITION_SECONDS}s ease-in-out`;
    panel.style.willChange = 'transform';
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

  // Create a static panel that shows the prior page in an iframe and remains visible
  function createStaticReturnPanel(startLeftPx, payload, pagePath) {
    const panel = document.createElement('div');
    panel.className = 'page-transition-panel';
    panel.setAttribute('data-persistent', 'true');
    panel.setAttribute('data-return-panel', 'true');
    const left = Math.max(0, Math.floor(startLeftPx));
    panel.style.left = left + 'px';
    panel.style.width = Math.max(0, window.innerWidth - left) + 'px';
    panel.style.height = '100dvh';
    // Keep static and visible; no slide-out
    panel.style.transform = 'translateX(0)';
    panel.style.transition = 'none';
    // Below <aside> (100000) but above overlay (99998 in this flow)
    panel.style.zIndex = '99999';
    panel.style.background = 'white';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.overflow = 'hidden';
    panel.style.pointerEvents = 'none';

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    panel.appendChild(iframe);

    document.body.appendChild(panel);

    if (pagePath) {
      // Prefer loading the actual page and extracting its .content reliably
      iframe.src = pagePath;
      iframe.addEventListener('load', () => {
        try {
          const doc = iframe.contentWindow && iframe.contentWindow.document;
          if (doc) {
            const c = doc.querySelector('.content');
            if (c) {
              doc.body.innerHTML = c.outerHTML;
            }
          }
        } catch (_) {
          // Cross-origin or other access issues: fall back to sliding anyway
        }
        // Keep visible; no further animation
      });
    } else if (payload && payload.html) {
      // Fallback to injecting captured HTML via srcdoc for maximum compatibility
      const cssLinks = Array.isArray(payload.css) ? payload.css : [];
      const cssTags = cssLinks
        .map((href) => `<link rel="stylesheet" href="${href}">`)
        .join('\n');
      const docHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="stylesheet" href="https://use.typekit.net/xjz3mil.css">\n${cssTags}\n<style>html,body{margin:0;padding:0;background:#fff;}</style></head><body>\n${payload.html}\n</body></html>`;
      try {
        iframe.srcdoc = docHtml;
        // Keep visible; no further animation
      } catch (_) {
        // As a last resort, write into the iframe
        try {
          const doc = iframe.contentWindow && iframe.contentWindow.document;
          if (doc) {
            doc.open();
            doc.write(docHtml);
            doc.close();
          }
        } catch (_) {}
      }
    } else {
      // No content available; panel still remains (blank)
    }

    return panel;
  }

  // Keep a return panel aligned with the right edge of the sub-categories
  function repositionReturnPanel() {
    try {
      const panel = document.querySelector('.page-transition-panel[data-return-panel="true"]');
      if (!panel) return;
      // Measure the live position of the sub-categories container
      const rect = subCategoryContainer.getBoundingClientRect();
      const left = Math.max(0, Math.floor(rect.right));
      panel.style.left = left + 'px';
      panel.style.width = Math.max(0, window.innerWidth - left) + 'px';
    } catch (_) {}
  }

  

  subNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHref = link.getAttribute('href');
      // Immediately mark this link active and persist selection
      try {
        sessionStorage.setItem(SUB_ACTIVE_KEY, normaliseLabel(link.textContent));
      } catch (_) {}
      subNavLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      

      // We'll calculate the origin left after the sidebar finishes collapsing
      let panelEl = null;

      const onCategoriesEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        sidebarCategoriesSection.removeEventListener('transitionend', onCategoriesEnd);

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
        subCategoryContainer.style.transition = `transform ${TRANSITION_SECONDS}s ease`;
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

  asideEl.style.display = 'none';
  sidebarCategoriesSection.style.display = 'none';
  subCategoryContainer.style.display = 'none';

  // After initial state set, optionally open the sidebar with sub-menu instantly visible
  if (showCategoriesOnLoad) {
    try { sessionStorage.removeItem('ISOv8__returnShowCategories'); } catch (_) {}
    // Prepare base sidebar state (same as openSidebar, but without hiding sub-categories)
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    if (heroFlexbox) heroFlexbox.style.position = 'fixed';
    if (overlay) {
      overlay.style.display = 'block';
      // Keep overlay below any transition panels we create (panel zIndex 99999)
      overlay.style.zIndex = '99998';
      overlay.style.opacity = '0';
    }
    asideEl.style.display = 'flex';
    sidebarCategoriesSection.style.display = 'block';

    // Show the sub-categories panel fully open (no animations/clip-path)
    // and display the 'blueprint-files' group.
    const desiredLabel = 'Blueprint Files';
    // Remove any animation classes and disable transitions for an instant state set
    subCategoryContainer.classList.remove('closing', 'reveal-band', 'reveal-open');
    const prevTransition = subCategoryContainer.style.transition;
    subCategoryContainer.style.transition = 'none';
    subCategoryContainer.style.clipPath = 'none';
    subCategoryContainer.style.webkitClipPath = 'none';

    // Make the panel visible and in its final on-screen position
    subCategoryContainer.style.display = 'flex';
    subCategoryContainer.style.transform = 'translateX(0)';
    subCategoryContainer.style.overflowY = 'auto';

    // Show only the Blueprint Files group
    hideAllSubCategories();
    const blueprint = subCategoryContainer.querySelector('.blueprint-files');
    if (blueprint) blueprint.style.display = 'block';

    // Highlight the matching top-level category link
    categoryLinks.forEach((l) => l.classList.remove('active'));
    categoryLinks.forEach((l) => {
      try {
        if (normaliseLabel(l.textContent) === desiredLabel) l.classList.add('active');
      } catch (_) {}
    });

    // Position the aside so the sub-menu is already onscreen: shift left by the
    // categories panel width, then animate the aside to 0 to reveal categories.
    // Force layout before measuring to avoid 0 widths, and provide a safe fallback
    void sidebarCategoriesSection.offsetWidth;
    const measuredCat = sidebarCategoriesSection.offsetWidth || 0;
    const catWidth = measuredCat > 0 ? measuredCat : 300;
    const prevAsideTransition = asideEl.style.transition;
    asideEl.style.transition = 'none';
    asideEl.style.transform = `translateX(-${catWidth}px)`;
    void asideEl.offsetWidth; // reflow to commit initial position without animation

    // If we have a previous page, place it to the right of the visible sub-menu and keep it visible
    let exitPanel = null;
    if ((returnPagePath && typeof returnPagePath === 'string') || (returnFramePayload && returnFramePayload.html)) {
      // Ensure sub-menu has a sensible width; fallback to 350px (CSS sets 350px)
      void subCategoryContainer.offsetWidth;
      const measuredSub = subCategoryContainer.offsetWidth || 0;
      const subWidth = measuredSub > 0 ? measuredSub : 350;
      exitPanel = createStaticReturnPanel(subWidth, returnFramePayload, returnPagePath);
      // Keep the panel correctly aligned during initial paint and subsequent layout
      repositionReturnPanel();
      requestAnimationFrame(repositionReturnPanel);
      window.addEventListener('resize', repositionReturnPanel);
      // Clear flags immediately so this only happens on first return
      try { sessionStorage.removeItem('ISOv8__returnFrameHTML'); } catch (_) {}
      try { sessionStorage.removeItem('ISOv8__returnPagePath'); } catch (_) {}
    }

    // Next frame: animate the aside and overlay in (force transition recognition)
    requestAnimationFrame(() => {
      // Ensure we have an explicit transition so the move animates
      asideEl.style.transition = `transform ${TRANSITION_SECONDS}s ease-in-out`;
      // Reflow so the browser acknowledges the transition change
      void asideEl.offsetWidth;
      // Start the slide-in
      asideEl.style.transform = 'translateX(0)';
      // In unison, slide the return panel left, underneath the sidebar
      if (exitPanel) {
        try {
          // Ensure the panel will animate transform
          exitPanel.style.transition = `transform ${RETURN_PANEL_SECONDS}s ease-in-out`;
          exitPanel.style.willChange = 'transform';
          // Move fully off the left edge of the viewport
          const offX = Math.ceil(window.innerWidth + 2);
          // Reflow before changing transform so the transition applies
          void exitPanel.offsetWidth;
          exitPanel.style.transform = `translateX(-${offX}px)`;

          // After the panel finishes sliding, remove it from the DOM
          let cleaned = false;
          const cleanupPanel = () => {
            if (cleaned) return;
            cleaned = true;
            try { exitPanel.removeEventListener('transitionend', onPanelEnd); } catch (_) {}
            try { window.removeEventListener('resize', repositionReturnPanel); } catch (_) {}
            try { exitPanel.remove(); } catch (_) {}
          };
          const onPanelEnd = (pe) => {
            if (pe.propertyName !== 'transform') return;
            cleanupPanel();
          };
          exitPanel.addEventListener('transitionend', onPanelEnd);
          // Fallback in case the transitionend event is missed
          setTimeout(cleanupPanel, Math.ceil((RETURN_PANEL_SECONDS * 1000) + 200));
        } catch (_) {}
      }
      if (overlay) overlay.style.opacity = '1';
      // Restore transitions for future user-initiated sub-menu animations
      subCategoryContainer.style.transition = prevTransition || '';
      // When the aside finishes its slide, re-align the return panel
      if (exitPanel) {
        const onAsideEnd = (e) => {
          if (e.propertyName !== 'transform') return;
          asideEl.removeEventListener('transitionend', onAsideEnd);
          requestAnimationFrame(repositionReturnPanel);
        };
        asideEl.addEventListener('transitionend', onAsideEnd);
      }
    });
  }

  
});
