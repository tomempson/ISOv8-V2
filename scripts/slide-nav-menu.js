function slideNavigationMenu(clickedElement) {
  const navAll = document.querySelector('.navigation-all');
  const navSubCatagory = document.querySelector('.navigation-sub-catagory');

  navAll.style.transition = 'transform 0.25s ease-in-out';
  navAll.style.transform = 'translateX(100vw)';

  navSubCatagory.style.display = 'flex';
  navSubCatagory.style.transform = 'translateX(-100vw)';

  requestAnimationFrame(() => {
    navSubCatagory.style.transition = 'transform 0.25s ease-in-out';
    navSubCatagory.style.transform = 'translateX(0)';
  });

  navAll.addEventListener('transitionend', function handleTransitionEnd() {
    navAll.style.display = 'none';
    navAll.removeEventListener('transitionend', handleTransitionEnd);
  });

  const clickedText = clickedElement?.textContent?.trim().toLowerCase();

  document.querySelectorAll('.navigation-sub-catagory > div').forEach(div => {
    div.classList.remove('active');
  });

  const slug = clickedText.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const targetSelector = `.sidebar-sub-catagory-${slug}`;
  const targetSubCat = document.querySelector(targetSelector);

  if (targetSubCat) {
    targetSubCat.classList.add('active');
  }
}