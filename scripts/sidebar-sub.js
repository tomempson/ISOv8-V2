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
    const SUB_ACTIVE_KEY = 'ISOv8_sub_active_text';
    const normaliseLabel = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const TRANSITION_SECONDS = 0.9;
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

      // Derive the home URL from any return button, else fallback
      let homeHref = '/index.html';
      try {
        const ret = document.querySelector('a.sidebar-return-button[href]');
        if (ret && ret.getAttribute('href')) homeHref = ret.getAttribute('href');
      } catch (_) {}

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
      const stored = sessionStorage.getItem(SUB_ACTIVE_KEY);
      if (stored) {
        const subLinks = document.querySelectorAll('.sidebar-sub-navigation-text');
        subLinks.forEach((l) => l.classList.remove('active'));
        subLinks.forEach((l) => {
          try {
            if (normaliseLabel(l.textContent) === stored) {
              l.classList.add('active');
            }
          } catch (_) {}
        });
      }
    } catch (_) {
      // Ignore storage access failures
    }

    // Preload the home background iframe so it is visible during transitions
    try {
      const { iframe } = createHomeBackgroundPanel();
      // No-op listener to mark readiness if needed later
      if (iframe) {
        iframe.addEventListener('load', () => {
          try { iframe.setAttribute('data-loaded', 'true'); } catch (_) {}
        }, { once: true });
      }
    } catch (_) {}

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
          try { sessionStorage.setItem(SUB_ACTIVE_KEY, normaliseLabel(l.textContent)); } catch (_) {}
          subLinks.forEach((n) => n.classList.remove('active'));
          l.classList.add('active');

          // Prevent default and run the transition
          if (href) e.preventDefault();

          // Ensure home is visible beneath during content slide-out (preloaded on init)
          createHomeBackgroundPanel();

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
          if (isAnimating) { e.preventDefault(); return; }
          isAnimating = true;
          const href = a.getAttribute('href') || '/';
          // Signal destination to open categories immediately
          try { sessionStorage.setItem('ISOv8__returnShowCategories', '1'); } catch (_) {}
          try {
            // Record the current page so destination can show it in an iframe
            const loc = window.location || {};
            const rel = (loc.pathname || '') + (loc.search || '') + (loc.hash || '');
            if (rel && typeof rel === 'string') {
              sessionStorage.setItem('ISOv8__returnPagePath', rel);
            }
          } catch (_) {}

          // Prevent default navigation and animate out/in
          e.preventDefault();

          // Ensure home is visible beneath while content moves out (preloaded on init)
          createHomeBackgroundPanel();

          slideContentOut(() => {
            const startLeft = getSidebarRightEdge();
            const { panel, iframe } = createSlidingPanel(href, startLeft);
            const onLoaded = () => {
              iframe.removeEventListener('load', onLoaded);
              // Show only the target page's .content inside the iframe
              reduceIframeToOnlyContent(iframe);
              void panel.offsetWidth;
              panel.style.transform = 'translateX(0)';
              const onPanelEnd = (ev) => {
                if (ev.propertyName !== 'transform') return;
                panel.removeEventListener('transitionend', onPanelEnd);
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

    // No sub-page hamburger sidebar logic; leave behavior to page styles/markup.
  }
})();
