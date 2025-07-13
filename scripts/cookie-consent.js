function handleCookieConsent(action) {
  const cookieConsentBanner = document.getElementById('cookie-consent');

  if (action === 'close' && cookieConsentBanner) {
    cookieConsentBanner.style.transition = 'opacity 0.3s ease';
    cookieConsentBanner.style.opacity = '0';

    setTimeout(() => {
      cookieConsentBanner.style.display = 'none';
    }, 300);
  }
}