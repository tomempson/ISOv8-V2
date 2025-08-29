(function () {
  // Destination for the site home page
  var HOME_URL = 'https://tomempson.github.io/ISOv8-V2/';
  var RESTORE_KEY = 'ISOv8_restore_both_open';
  var RESTORE_SLUG_KEY = 'ISOv8_restore_slug';

  function slugify(str) {
    return (str || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  function getCurrentCategorySlug() {
    // Prefer the class on the sub page's .sidebar-flexbox (e.g. "blueprint-files")
    var flex = document.querySelector('.sidebar > aside .sidebar-flexbox, aside .sidebar-flexbox');
    if (flex && flex.classList) {
      for (var i = 0; i < flex.classList.length; i++) {
        var cls = flex.classList[i];
        if (cls !== 'sidebar-flexbox') return cls;
      }
    }
    // Fallback to the heading text
    var h2 = document.querySelector('.sidebar-heading');
    if (h2) return slugify(h2.textContent);
    return null;
  }

  function redirectHomeWithRestore() {
    var slug = getCurrentCategorySlug();
    try {
      sessionStorage.setItem(RESTORE_KEY, '1');
      if (slug) sessionStorage.setItem(RESTORE_SLUG_KEY, slug);
    } catch (e) {}
    window.location.href = HOME_URL;
  }

  function attachListener() {
    // Only run this behavior on sub pages (home has #sidebar-navigation-categories)
    if (document.getElementById('sidebar-navigation-categories')) return;

    // Proactively record the current sub category so Home can restore
    try {
      var initSlug = getCurrentCategorySlug();
      if (initSlug) {
        sessionStorage.setItem(RESTORE_KEY, '1');
        sessionStorage.setItem(RESTORE_SLUG_KEY, initSlug);
      }
    } catch (_) {}

    var btn = document.querySelector('.sidebar-return-button');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        redirectHomeWithRestore();
      }, { capture: true });
    }

    // Also handle header logo links that point home
    var logoLinks = document.querySelectorAll('.logo-return-link[href]');
    logoLinks.forEach(function (a) {
      try {
        var href = a.getAttribute('href') || '';
        if (!href) return;
        var u = new URL(href, window.location.href);
        var norm = u.href.replace(/\/+$/, '/');
        var homeNorm = HOME_URL.replace(/\/+$/, '/');
        if (norm !== homeNorm) return; // only intercept links to HOME_URL
      } catch (_) { return; }

      a.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        redirectHomeWithRestore();
      }, { capture: true });
    });

    // Also set flags on pagehide so browser Back (BFCache) is covered
    window.addEventListener('pagehide', function () {
      try {
        var slug = getCurrentCategorySlug();
        sessionStorage.setItem(RESTORE_KEY, '1');
        if (slug) sessionStorage.setItem(RESTORE_SLUG_KEY, slug);
      } catch (_) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListener);
  } else {
    attachListener();
  }
})();

// Highlight active sub-category link on sub pages
(function () {
  var ACTIVE_KEY = 'ISOv8_sub_active_text';

  function normaliseLabel(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function applyActive(label) {
    var links = document.querySelectorAll('.sidebar-sub-navigation-text');
    links.forEach(function (l) { l.classList.remove('active'); });
    if (!label) return;
    var norm = normaliseLabel(label);
    for (var i = 0; i < links.length; i++) {
      if (normaliseLabel(links[i].textContent) === norm) {
        links[i].classList.add('active');
        break;
      }
    }
  }

  function initActive() {
    // Prefer a stored selection from the last click
    var stored = null;
    try { stored = sessionStorage.getItem(ACTIVE_KEY); } catch (e) {}

    // Fallback: match the page's H1 text if present
    var label = stored;
    if (!label) {
      var h1 = document.querySelector('h1');
      if (h1) label = h1.textContent;
    }
    applyActive(label);

    // When user clicks a sub link, store and let navigation proceed
    var links = document.querySelectorAll('.sidebar-sub-navigation-text');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        try { sessionStorage.setItem(ACTIVE_KEY, normaliseLabel(link.textContent)); } catch (e) {}
      }, { capture: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActive);
  } else {
    initActive();
  }
})();
