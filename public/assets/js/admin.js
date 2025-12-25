/**
 * Admin Layout Script.
 *
 * Handles user interface interactions specific to the Admin Panel layout.
 * Primarily responsible for toggling the mobile sidebar navigation menu
 * by manipulating Tailwind CSS classes.
 */

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const openSidebarButton = document.getElementById("open-sidebar");

  if (sidebar && sidebarOverlay && openSidebarButton) {
    /**
     * Opens the mobile sidebar.
     * Removes the translation transform to slide it into view
     * and reveals the background overlay.
     */
    openSidebarButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      sidebar.classList.remove("-translate-x-full");
      sidebarOverlay.classList.remove("hidden");
    });

    /**
     * Closes the mobile sidebar.
     */
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
      sidebarOverlay.classList.add("hidden");
    });
  }
});
