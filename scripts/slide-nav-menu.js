function slideNavigationMenu(clickedElement) {
  const navAll = document.querySelector('.navigation-all');
  const navSubCatagory = document.querySelector('.navigation-sub-catagory');

  navAll.style.transition = 'transform 0.5s ease-in-out';
  navAll.style.transform = 'translateX(100vw)';

  navSubCatagory.style.display = 'flex';
  navSubCatagory.style.transform = 'translateX(-100vw)';

  requestAnimationFrame(() => {
    navSubCatagory.style.transition = 'transform 0.5s ease-in-out';
    navSubCatagory.style.transform = 'translateX(0)';
  });

  navAll.addEventListener('transitionend', function handleTransitionEnd() {
    navAll.style.display = 'none';
    navAll.removeEventListener('transitionend', handleTransitionEnd);
  });

  const clickedText = clickedElement?.textContent?.trim().toLowerCase();
  const subNavLink = document.querySelector('.navigation-sub-catagory .sidebar-navigation-links');

  if (clickedText === 'general information' && subNavLink) {
    subNavLink.textContent = 'General Information Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'how-to' && subNavLink) {
    subNavLink.textContent = 'How-To Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'understanding' && subNavLink) {
    subNavLink.textContent = 'Understanding Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'container conversion examples' && subNavLink) {
    subNavLink.textContent = 'Container Conversion Examples Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'case studies & customer stories' && subNavLink) {
    subNavLink.textContent = 'Case Studies & Customer Stories Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'planning & design' && subNavLink) {
    subNavLink.textContent = 'Planning & Design Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'regulations & complience' && subNavLink) {
    subNavLink.textContent = 'Regulations & Complience Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'finance & ownership' && subNavLink) {
    subNavLink.textContent = 'Finance & Ownership Sub Catagory';
    subNavLink.href = '#';
  } else if (clickedText === 'maintainence & lifespan' && subNavLink) {
    subNavLink.textContent = 'Maintainence & Lifespan Sub Catagory';
    subNavLink.href = '#';
  }
}