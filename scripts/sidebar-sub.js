function goBackWithFallback(fallbackURL = '/') {
  if (document.referrer) {
    history.back();
  } else {
    window.location.href = fallbackURL;
  }
}