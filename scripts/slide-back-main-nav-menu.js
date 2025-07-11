function slideBackToMainNavigation() {
  const navAll = document.querySelector('.navigation-all');
  const navSubCatagory = document.querySelector('.navigation-sub-catagory');

  navAll.style.display = 'flex';
  navAll.style.transform = 'translateX(100vw)';

  requestAnimationFrame(() => {
    navAll.style.transition = 'transform 0.25s ease-in-out';
    navAll.style.transform = 'translateX(0)';
  });

  navSubCatagory.style.transition = 'transform 0.25s ease-in-out';
  navSubCatagory.style.transform = 'translateX(-100vw)';

  navSubCatagory.addEventListener('transitionend', function handleBackTransition() {
    navSubCatagory.style.display = 'none';
    navSubCatagory.removeEventListener('transitionend', handleBackTransition);
  });
}