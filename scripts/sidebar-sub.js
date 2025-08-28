

(function () {
  // Destination for the site home page
  var HOME_URL = 'https://tomempson.github.io/ISOv8-V2/';

  function normalisePathname(pathname) {
    // Keep a trailing slash only for root-like paths
    if (pathname === '/') return pathname;
    // Collapse multiple trailing slashes to one
    return pathname.replace(/\/+$/, '/');
  }

  function isHomeReferrer(urlStr) {
    try {
      var u = new URL(urlStr);
      if (u.origin !== 'https://tomempson.github.io') return false;
      var p = normalisePathname(u.pathname);
      return p === '/ISOv8-V2/' || p === '/ISOv8-V2/index.html';
    } catch (e) {
      return false;
    }
  }

  function goHome() {
    window.location.href = HOME_URL;
  }

  function handleReturnClick(e) {
    // Prevent the default <a> navigation inside the button
    e.preventDefault();
    e.stopPropagation();

    var ref = document.referrer;

    // If the last page was the site's home page, go back to it via history.
    // Otherwise (external site, other internal page, no referrer), go to HOME_URL.
    if (ref && isHomeReferrer(ref) && window.history.length > 1) {
      window.history.back();
    } else {
      goHome();
    }
  }

  function attachListener() {
    var btn = document.querySelector('.sidebar-return-button');
    if (!btn) return;

    // Capture phase to beat any default link behaviour inside the button
    btn.addEventListener('click', handleReturnClick, { capture: true });

    // Also attach directly to an <a> inside the button, if present
    var innerLink = btn.querySelector('a');
    if (innerLink) {
      innerLink.addEventListener('click', handleReturnClick, { capture: true });
    }
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
