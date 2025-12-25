/**
 * Handles general UI interactions that are common across the application,
 * such as the responsive mobile navigation menu and the "scroll to top" button.
 */

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  if (menuToggle && menu) {
    /**
     * Toggles the visibility of the mobile menu when the hamburger icon is clicked.
     */
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });

    /**
     * Closes the mobile menu if the user clicks anywhere outside of it.
     */
    window.addEventListener("click", (e) => {
      if (
        !menu.classList.contains("hidden") &&
        !menu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        menu.classList.add("hidden");
      }
    });
  }

  const scrollToTopBtn = document.getElementById("scroll-to-top");

  if (scrollToTopBtn) {
    /**
     * Monitors scroll position to toggle button visibility.
     * Shows button when scrolled down > 200px, hides it otherwise.
     */
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        scrollToTopBtn.classList.remove("opacity-0", "translate-y-4");
        scrollToTopBtn.classList.add("opacity-100", "translate-y-0");
      } else {
        scrollToTopBtn.classList.remove("opacity-100", "translate-y-0");
        scrollToTopBtn.classList.add("opacity-0", "translate-y-4");
      }
    });

    /**
     * Smoothly scrolls the window back to the top when clicked.
     */
    scrollToTopBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }
});
