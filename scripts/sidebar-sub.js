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
        a.addEventListener('click', () => {
          try {
            sessionStorage.setItem('ISOv8__returnShowCategories', '1');
          } catch (_) {
            // Fail silently if storage is unavailable
          }
        });
      });
    } catch (_) {
      // No-op if DOM/query fails
    }
  }
})();
