

document.addEventListener('DOMContentLoaded', () => {
  const returnBtn = document.querySelector('.sidebar-return-button');
  const sidebarWrapper = document.querySelector('.sidebar');
  const asideEl = sidebarWrapper ? sidebarWrapper.querySelector('aside') : null;

  if (!returnBtn || !sidebarWrapper || !asideEl) return;

  returnBtn.addEventListener('click', () => {
    // Ensure the sidebar wrapper is visible during the animation
    sidebarWrapper.style.display = 'block';

    // Make sure the aside starts at its on-screen position
    asideEl.style.transform = 'translateX(0)';

    // Lock the wrapper's current width so we can animate it down to 0
    const currentWidth = sidebarWrapper.getBoundingClientRect().width || asideEl.getBoundingClientRect().width;
    sidebarWrapper.style.width = `${currentWidth}px`;

    // Force reflow so the transition definitely applies to the next change
    void asideEl.offsetWidth;
    void sidebarWrapper.offsetWidth;

    // Start both animations in sync: panel slides left, wrapper width shrinks to 0
    asideEl.style.transform = 'translateX(-100%)';
    sidebarWrapper.style.width = '0px';

    // After the width transition finishes, hide the wrapper
    const onWidthEnd = (ev) => {
      if (ev.propertyName !== 'width') return;
      sidebarWrapper.removeEventListener('transitionend', onWidthEnd);
      // Hide the wrapper now that the space is reclaimed
      sidebarWrapper.style.display = 'none';
    };

    // Listen for the wrapper's width transition end (content has fully filled the space)
    sidebarWrapper.addEventListener('transitionend', onWidthEnd);
  });
});