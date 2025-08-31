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
            // Signal destination to open categories immediately
            sessionStorage.setItem('ISOv8__returnShowCategories', '1');
          } catch (_) {}
          try {
            // Record the current page so destination can show it in an iframe
            const loc = window.location || {};
            const rel =
              (loc.pathname || '') + (loc.search || '') + (loc.hash || '');
            if (rel && typeof rel === 'string') {
              sessionStorage.setItem('ISOv8__returnPagePath', rel);
            }
          } catch (_) {
            // Fail silently if storage is unavailable
          }
        });
      });
    } catch (_) {
      // No-op if DOM/query fails
    }

    try {
      // 4) Sub-page sidebar open/close mirroring main behavior
      const toggleBtn = document.querySelector('.js-sub-menu-toggle');
      const bodyFlex = document.querySelector('.body-flexbox');
      const sidebarWrap = document.querySelector('.sidebar');
      const aside = document.querySelector('.sidebar aside, .sidebar > aside, aside');
      const overlay = document.getElementById('sidebar-overlay');

      function openSubSidebar() {
        if (!bodyFlex || !sidebarWrap || !aside) return;
        // Disable flex layout to prevent content reflow conflicts
        try { bodyFlex.style.display = 'block'; } catch (_) {}

        // Prepare overlay
        if (overlay) {
          overlay.style.display = 'block';
          overlay.style.opacity = '0';
        }

        // Make wrapper overlay the page content
        sidebarWrap.style.display = 'block';
        sidebarWrap.style.position = 'absolute';
        sidebarWrap.style.top = '0';
        sidebarWrap.style.left = '0';
        sidebarWrap.style.zIndex = '100001';

        // Slide the aside in from the left
        aside.style.display = 'flex';
        aside.style.transform = 'translateX(-100%)';
        // Next frame, animate to onscreen
        requestAnimationFrame(() => {
          if (overlay) overlay.style.opacity = '1';
          aside.style.transform = 'translateX(0)';
        });
      }

      function closeSubSidebar() {
        if (!bodyFlex || !sidebarWrap || !aside) return;
        // Slide out
        aside.style.transform = 'translateX(-100%)';
        // Fade overlay
        if (overlay) overlay.style.opacity = '0';
        // After transition, cleanup
        const onEnd = (e) => {
          if (e.propertyName !== 'transform') return;
          try { aside.removeEventListener('transitionend', onEnd); } catch (_) {}
          if (overlay) overlay.style.display = 'none';
          // Restore layout defaults
          bodyFlex.style.display = '';
          sidebarWrap.style.display = '';
          sidebarWrap.style.position = '';
          sidebarWrap.style.top = '';
          sidebarWrap.style.left = '';
          sidebarWrap.style.zIndex = '';
          aside.style.display = '';
          aside.style.transform = '';
        };
        try { aside.addEventListener('transitionend', onEnd); } catch (_) { onEnd({ propertyName: 'transform' }); }
      }

      if (toggleBtn && bodyFlex && sidebarWrap && aside) {
        // Capture and stop other handlers (from scripts/sidebar.js)
        toggleBtn.addEventListener(
          'click',
          (e) => {
            try { e.preventDefault(); e.stopImmediatePropagation(); } catch (_) {}
            openSubSidebar();
          },
          { capture: true }
        );
      }
      if (overlay) {
        overlay.addEventListener('click', closeSubSidebar);
      }
      // Optional: ESC to close
      try {
        document.addEventListener('keydown', (ev) => {
          if (ev.key === 'Escape') closeSubSidebar();
        });
      } catch (_) {}
    } catch (_) {
      // Fail silently if DOM/query fails
    }
  }
})();
