document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.hero-cta-circle-button');
  const modal = document.getElementById('contact-modal');

  let isShown = false;

  button.addEventListener('click', () => {
    if (isShown) return;
    document.body.style.position = 'fixed';
    const heroFlex = document.querySelector('.hero-flexbox');
    if (heroFlex) heroFlex.style.position = 'fixed';
    isShown = true;
    modal.style.display = 'block';
    modal.style.pointerEvents = 'auto';
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
    });
  });

  // Close modal on close-button click
  const closeBtn = document.querySelector('.contact-modal-close-button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Trigger reverse ring animation immediately
      const button = document.querySelector('.hero-cta-circle-button');
      if (button) {
        // Remove animation and clicked state immediately, then start reverse animation
        button.classList.remove('ring-animate', 'clicked');
        button.classList.add('ring-reverse');
        button.addEventListener('animationend', () => {
          // Cleanup reverse state after animation completes
          button.classList.remove('ring-reverse');
        }, { once: true });
      }
      // Fade out modal
      modal.style.opacity = '0';
      // After fade completes, hide and reset page styles
      modal.addEventListener('transitionend', () => {
        modal.style.pointerEvents = 'none';
        modal.style.display = 'none';
        document.body.style.position = '';
        const heroFlex = document.querySelector('.hero-flexbox');
        if (heroFlex) heroFlex.style.position = '';
        isShown = false;
      }, { once: true });
    });
  }
});