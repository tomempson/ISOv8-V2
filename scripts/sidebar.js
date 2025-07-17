

// Show the matching sub‑category block when a main sidebar item is clicked
document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------ */
  /* Element references                                                 */
  /* ------------------------------------------------------------------ */
  const categoryLinks = document.querySelectorAll(
    '#sidebar-navigation-categories .sidebar-navigation-text'
  );

  const subCategoryContainer = document.getElementById(
    'sidebar-navigation-sub-categories'
  );

  const subCategoryGroups =
    subCategoryContainer.querySelectorAll('.sidebar-flexbox');

  const openSidebarBtn = document.querySelector('.hamburger-menu-button');
  const closeSidebarBtn = document.querySelector('.sidebar-close-button');
  const sidebarCategoriesSection = document.getElementById('sidebar-navigation-categories');

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  // e.g. "General Information" → "general-information"
  const slugify = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

  const hideAllSubCategories = () => {
    subCategoryGroups.forEach((el) => {
      el.style.display = 'none';
    });
  };

  const openSidebar = () => {
    sidebarCategoriesSection.style.display = 'block';

    // Reset sub‑categories so nothing is shown until a main item is clicked
    subCategoryContainer.style.display = 'none';
    hideAllSubCategories();
  };

  const closeSidebar = () => {
    // Hide the main sidebar pane
    sidebarCategoriesSection.style.display = 'none';

    // Also hide any visible sub‑category container and its blocks
    subCategoryContainer.style.display = 'none';
    hideAllSubCategories();
  };

  /* ------------------------------------------------------------------ */
  /* Event wiring                                                       */
  /* ------------------------------------------------------------------ */
  if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', openSidebar);
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
  }

  categoryLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const slug = slugify(link.textContent);

      const target = subCategoryContainer.querySelector(`.${slug}`);
      if (!target) {
        console.warn(`No sub‑category block found for "${slug}"`);
        return;
      }

      // Reveal the container (it is display:none in the CSS by default)
      subCategoryContainer.style.display = 'block';

      hideAllSubCategories();
      target.style.display = 'block';
    });
  });

  // Start with every sub‑category hidden
  hideAllSubCategories();

  // Ensure the main sidebar pane starts hidden
  closeSidebar();
});