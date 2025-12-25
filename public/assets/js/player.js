/**
 * Media Player Script.
 *
 * Handles user interactions on the public media player page.
 */

document.addEventListener("DOMContentLoaded", function () {
  const copyButton = document.getElementById("copy-button");
  const mediaUrlInput = document.getElementById("media-url");

  if (copyButton && mediaUrlInput) {
    /**
     * Copies the media URL from the readonly input field to the system clipboard.
     */
    copyButton.addEventListener("click", function () {
      mediaUrlInput.select();
      mediaUrlInput.setSelectionRange(0, 99999); // Ensure selection on mobile devices

      navigator.clipboard
        .writeText(mediaUrlInput.value)
        .then(() => {
          copyButton.textContent = "Copied!";
          setTimeout(() => (copyButton.textContent = "Copy"), 2000);
        })
        .catch(() => alert("Failed to copy URL."));
    });
  }
});
