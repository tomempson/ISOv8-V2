document.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.querySelector('.sidebar-close-button');

  if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener('click', () => {
      sidebar.style.display = 'flex'; // Set before opacity transition
      requestAnimationFrame(() => {
        sidebar.classList.add('visible'); // Triggers fade-in
      });
      document.body.style.overflow = 'hidden'; // Disable scroll
    });
  }

  if (closeButton && sidebar) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('visible'); // Triggers fade-out

      // After transition, hide the sidebar completely
      setTimeout(() => {
        sidebar.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scroll
      }, 300); // Match transition duration
    });
  }
});