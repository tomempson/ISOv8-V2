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

    try {
      // 2) Persist active selection on sub-page link clicks
      const subLinks = document.querySelectorAll('.sidebar-sub-navigation-text');
      subLinks.forEach((l) => {
        l.addEventListener('click', () => {
          try {
            sessionStorage.setItem(SUB_ACTIVE_KEY, normaliseLabel(l.textContent));
          } catch (_) {}
          subLinks.forEach((n) => n.classList.remove('active'));
          l.classList.add('active');
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
          // Ensure we take the user to the correct home page path
          // regardless of whether the anchor uses '/'.
          try {
            e.preventDefault();
          } catch (_) {}
          try {
            sessionStorage.setItem('ISOv8__returnShowCategories', '1');
          } catch (_) { /* ignore */ }
          try {
            // Store where we came from so index can show it in an iframe then slide it away
            const href = window.location && window.location.href ? window.location.href : 'sub-catagory.html';
            sessionStorage.setItem('ISOv8__returnFromHref', href);
          } catch (_) {
            // Fail silently if storage is unavailable
          }
          // Resolve a robust home URL: prefer the header logo link if present,
          // otherwise fall back to 'index.html' relative to the current directory.
          try {
            // Prefer a same-directory index.html to support local dev paths
            const homeHref = new URL('index.html', window.location.href).href;
            window.location.assign(homeHref);
          } catch (_) {
            try {
              const logo = document.querySelector('a.logo-return-link');
              const fallback = logo && logo.getAttribute('href') ? logo.getAttribute('href') : 'index.html';
              window.location.assign(fallback);
            } catch (_) {
              // Last resort
              window.location.assign('index.html');
            }
          }
        });
      });
    } catch (_) {
      // No-op if DOM/query fails
    }
  }
})();
