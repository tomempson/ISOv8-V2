


document.addEventListener('DOMContentLoaded', () => {
  const popup = document.querySelector('.footer-popup');
  const links = document.querySelectorAll('.footer-sitemap-text');

  links.forEach(link => {
    link.addEventListener('click', () => {
      if (popup) {
        popup.style.display = 'flex';
        // Trigger opacity transition
        requestAnimationFrame(() => {
          popup.style.opacity = '1';
        });
      }
    });
  });

  // Close footer popup on close button click
  const closeBtn = document.querySelector('.footer-popup-close-button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (popup) {
        // Trigger fade-out
        popup.style.opacity = '0';
        // After transition, hide the element
        setTimeout(() => {
          popup.style.display = 'none';
        }, 300);
      }
    });
  }
});