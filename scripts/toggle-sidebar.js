document.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.querySelector('.sidebar-close-button');

  if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener('click', () => {
      sidebar.style.display = 'flex';
      requestAnimationFrame(() => {
        sidebar.classList.add('visible');
      });

      setTimeout(() => {
        document.querySelector('main').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
      }, 300); 

      document.body.style.overflow = 'hidden';
    });
  }

  if (closeButton && sidebar) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('visible');
      document.querySelector('main').style.display = 'block';
      document.querySelector('footer').style.display = 'block';
    
      setTimeout(() => {
        sidebar.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    });
  }
});