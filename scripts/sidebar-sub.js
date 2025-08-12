


document.addEventListener("DOMContentLoaded", function() {
  const returnButton = document.querySelector(".sidebar-return-button");
  const categoriesSection = document.querySelector("#sidebar-navigation-categories");
  const subCategoriesSection = document.querySelector("#sidebar-navigation-sub-categories");
  const blueprintPanel = document.querySelector(".sidebar-flexbox.blueprint-files");

  if (returnButton && categoriesSection) {
    returnButton.addEventListener("click", function() {
      categoriesSection.style.display = "flex";
      // keep sub category visible during animation; hide it after transition
      // Force a reflow so the transition reliably fires
      void categoriesSection.offsetWidth;
      categoriesSection.style.transform = "translateX(0)";

      const onCategoriesSlideInEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        if (subCategoriesSection) {
          subCategoriesSection.style.display = "none";
        }
        if (blueprintPanel) {
          blueprintPanel.style.display = "none";
        }
        categoriesSection.removeEventListener('transitionend', onCategoriesSlideInEnd);
      };
      categoriesSection.addEventListener('transitionend', onCategoriesSlideInEnd);
    });
  }
});