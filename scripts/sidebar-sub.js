// Handles post-navigation logging trigger from sub pages
// When an <a class="sidebar-return-button"> is clicked, set a session flag
// so the destination page (which loads scripts/sidebar.js) logs after redirect.
(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Use sub-pages specific keys so a background home iframe doesn't clear them
    const SUB_ACTIVE_KEY = 'ISOv8_sub_active_text'; // legacy/home usage
    const SUB_ACTIVE_KEY_SUB = 'ISOv8_sub_active_text_sub';
    const SUB_ACTIVE_HREF_KEY = 'ISOv8_sub_active_href_sub';
    const normaliseLabel = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const TRANSITION_SECONDS = 1.3;
    let isAnimating = false;

    // Helpers for transition panels on sub pages
    function getSidebarRightEdge() {
      try {
        const sb = document.querySelector('.sidebar');
        if (!sb) return 0;
        const rect = sb.getBoundingClientRect();
        // When sidebar is hidden on small screens, width is 0
        return Math.max(0, Math.floor(rect.right));
      } catch (_) {
        return 0;
      }
    }

    function createHomeBackgroundPanel() {
      // Only create once per page life
      let panel = document.querySelector('.page-transition-panel[data-role="home-bg"]');
      if (panel) return { panel, iframe: panel.querySelector('iframe') };
      panel = document.createElement('div');
      panel.className = 'page-transition-panel';
      panel.setAttribute('data-role', 'home-bg');
      panel.style.position = 'fixed';
      panel.style.left = '0';
      panel.style.top = '0';
      panel.style.width = '100vw';
      panel.style.height = '100dvh';
      // Layering: put below .content (which we set to 1) and far below aside (100000)
      // Use z-index 0 so it paints above the page background, but below our content.
      panel.style.zIndex = '0';
      panel.style.background = 'white';
      panel.style.pointerEvents = 'none';
      panel.style.overflow = 'hidden';

      // Use repo root path for home iframe
      let homeHref = '/ISOv8-V2/';

      const iframe = document.createElement('iframe');
      iframe.src = homeHref;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      iframe.style.display = 'block';
      panel.appendChild(iframe);
      document.body.appendChild(panel);

      // Ensure content sits above this background
      try {
        const content = document.querySelector('.content');
        if (content) {
          content.style.position = content.style.position || 'relative';
          content.style.zIndex = '1';
        }
      } catch (_) {}

      return { panel, iframe };
    }

    function createSlidingPanel(targetHref, startLeftPx) {
      const panel = document.createElement('div');
      panel.className = 'page-transition-panel';
      panel.style.position = 'fixed';
      panel.style.top = '0';
      const left = Math.max(0, Math.floor(startLeftPx || 0));
      panel.style.left = left + 'px';
      panel.style.width = Math.max(0, window.innerWidth - left) + 'px';
      panel.style.height = '100dvh';
      panel.style.zIndex = '99999'; // under aside (100000) but above content
      panel.style.background = 'white';
      panel.style.pointerEvents = 'none';
      panel.style.overflow = 'hidden';
      panel.style.transform = 'translateX(-100%)';
      panel.style.transition = `transform ${TRANSITION_SECONDS}s ease-in-out`;
      panel.style.willChange = 'transform';

      const iframe = document.createElement('iframe');
      iframe.src = targetHref;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      iframe.style.display = 'block';
      panel.appendChild(iframe);
      document.body.appendChild(panel);

      return { panel, iframe };
    }

    function slideContentOut(cb) {
      try {
        const content = document.querySelector('.content');
        if (!content) { cb && cb(); return; }
        content.style.willChange = 'transform';
        content.style.transition = `transform ${TRANSITION_SECONDS}s ease-in-out`;
        // Ensure starting position is set then animate
        content.style.transform = 'translateX(0)';
        // Reflow
        void content.offsetWidth;
        const onEnd = (e) => {
          if (e.propertyName !== 'transform') return;
          content.removeEventListener('transitionend', onEnd);
          cb && cb();
        };
        content.addEventListener('transitionend', onEnd);
        content.style.transform = 'translateX(-100%)';
      } catch (_) { cb && cb(); }
    }

    try {
      // 1) Mark the stored active sub-link on load
      const subLinks = document.querySelectorAll('.sidebar-sub-navigation-text');
      const clearAll = () => subLinks.forEach((l) => l.classList.remove('active'));
      const safePath = (p) => {
        if (!p) return '';
        try { return new URL(p, document.baseURI).pathname.replace(/\/+$/, ''); } catch (_) { return String(p); }
      };
      const linkPath = (el) => {
        try { return safePath(el.href || el.getAttribute('href')); } catch (_) { return ''; }
      };
      const baseName = (p) => {
        try { const s = p.split('?')[0]; const m = s.match(/[^\/]+$/); return m ? m[0] : ''; } catch (_) { return ''; }
      };

      clearAll();

      // Build normalized paths once
      const currentPath = safePath((window.location && window.location.href) || (window.location && window.location.pathname) || '');
      const currentBase = baseName(currentPath);
      const linksWithPaths = Array.from(subLinks).map((l) => ({ el: l, path: linkPath(l), base: null }));
      linksWithPaths.forEach((o) => { o.base = baseName(o.path); });

      let matched = false;

      // 1) Prefer the actual current page path
      if (currentPath) {
        for (const o of linksWithPaths) {
          if (o.path === currentPath) { o.el.classList.add('active'); matched = true; break; }
        }
      }

      // 2) If still not matched, use basename match (handles different parent dirs)
      if (!matched && currentBase) {
        for (const o of linksWithPaths) {
          if (o.base && o.base === currentBase) { o.el.classList.add('active'); matched = true; break; }
        }
      }

      // 3) Next, use stored href path (from previous interactions)
      if (!matched) {
        let storedHref = null;
        try { storedHref = sessionStorage.getItem(SUB_ACTIVE_HREF_KEY); } catch (_) {}
        const storedPath = safePath(storedHref);
        if (storedPath) {
          for (const o of linksWithPaths) {
            if (o.path === storedPath) { o.el.classList.add('active'); matched = true; break; }
          }
        }
      }

      // 4) Last resort: label match
      if (!matched) {
        let storedLabel = null;
        try { storedLabel = sessionStorage.getItem(SUB_ACTIVE_KEY_SUB) || sessionStorage.getItem(SUB_ACTIVE_KEY); } catch (_) {}
        if (storedLabel) {
          const s = normaliseLabel(storedLabel);
          for (const o of linksWithPaths) {
            try { if (normaliseLabel(o.el.textContent) === s) { o.el.classList.add('active'); matched = true; break; } } catch (_) {}
          }
        }
      }
    } catch (_) {
      // Ignore failures
    }

    // Do not preload the home background iframe; only create during transitions

    // Ensure only the `.content` element is shown inside a loaded iframe
    function reduceIframeToOnlyContent(iframe) {
      try {
        const doc = iframe && iframe.contentWindow && iframe.contentWindow.document;
        if (!doc) return;
        const c = doc.querySelector('.content');
        if (!c) return;
        // Keep head (for styles) but trim body to only the content block
        doc.body.innerHTML = c.outerHTML;
        // Minimal reset to avoid extra page margins/backgrounds
        try {
          const style = doc.createElement('style');
          style.textContent = 'html,body{margin:0;padding:0;background:#fff;}';
          doc.head.appendChild(style);
        } catch (_) {}
      } catch (_) {}
    }

    try {
      // 2) Persist active selection and animate navigation on sub-page link clicks
      const subLinks = document.querySelectorAll('.sidebar-sub-navigation-text');
      subLinks.forEach((l) => {
        l.addEventListener('click', (e) => {
          if (isAnimating) { e.preventDefault(); return; }
          isAnimating = true;
          const href = l.getAttribute('href');
          // Persist active state immediately
          try {
            const value = normaliseLabel(l.textContent);
            const href = l.getAttribute('href') || '';
            const path = href ? new URL(href, document.baseURI).pathname : '';
            sessionStorage.setItem(SUB_ACTIVE_KEY_SUB, value);
            // Also write legacy key for any other code paths that still use it
            sessionStorage.setItem(SUB_ACTIVE_KEY, value);
            if (path) sessionStorage.setItem(SUB_ACTIVE_HREF_KEY, path);
          } catch (_) {}
          subLinks.forEach((n) => n.classList.remove('active'));
          l.classList.add('active');

          // Prevent default and run the transition
          if (href) e.preventDefault();

          // Create home background only for the duration of this transition
          const homeBg = createHomeBackgroundPanel();

          // Step 1: slide current content off-screen left
          slideContentOut(() => {
            if (!href) { window.location.reload(); return; }
            // Step 2: create target panel off-screen and wait for load before slide-in
            const startLeft = getSidebarRightEdge();
            const { panel, iframe } = createSlidingPanel(href, startLeft);
            const onLoaded = () => {
              iframe.removeEventListener('load', onLoaded);
              // Show only the target page's .content inside the iframe
              reduceIframeToOnlyContent(iframe);
              // Reflow then slide-in
              void panel.offsetWidth;
              panel.style.transform = 'translateX(0)';
              const onPanelEnd = (ev) => {
                if (ev.propertyName !== 'transform') return;
                panel.removeEventListener('transitionend', onPanelEnd);
                // Remove the temporary home background before navigating away
                try { if (homeBg && homeBg.panel) homeBg.panel.remove(); } catch (_) {}
                // Navigate for real so address bar updates and history is correct
                window.location.href = href;
              };
              panel.addEventListener('transitionend', onPanelEnd);
            };
            iframe.addEventListener('load', onLoaded);
          });
        });
      });
    } catch (_) {
      // No-op if DOM/query fails
    }

    try {
      // 3) When returning to the index, request categories to be shown on load
      //    and record the current page so the home page can animate it out.
      const anchors = document.querySelectorAll('a.sidebar-return-button');
      anchors.forEach((a) => {
        a.addEventListener('click', (e) => {
          // No transition on sub pages for return; let the browser navigate normally
          try { e.stopImmediatePropagation(); } catch (_) {}
          // Set flags so home can optionally adjust its initial view
          try { sessionStorage.setItem('ISOv8__returnShowCategories', '1'); } catch (_) {}
          try {
            const loc = window.location || {};
            const rel = (loc.pathname || '') + (loc.search || '') + (loc.hash || '');
            if (rel && typeof rel === 'string') {
              sessionStorage.setItem('ISOv8__returnPagePath', rel);
            }
          } catch (_) {}
          // Do NOT preventDefault; allow anchor href to take effect immediately
        });
      });
    } catch (_) {
      // No-op if DOM/query fails
    }

    // No sub-page hamburger sidebar logic; leave behavior to page styles/markup.
  }
})();
