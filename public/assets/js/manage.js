/**
 * Media Management Script.
 */

/**
 * Reloads the page with updated query parameters for sorting.
 * Resets pagination to page 1.
 */
function sortMedia(sortOrder) {
  const url = new URL(window.location);
  url.searchParams.set("sort", sortOrder);
  url.searchParams.set("page", "1");
  window.location.href = url.toString();
}

/**
 * Toggles the UI state for a table row to show deletion confirmation buttons.
 * Hides the default action buttons and reveals "Yes/Cancel" options.
 */
function showConfirmation(id) {
  document.getElementById(`actions-default-${id}`).classList.add("hidden");
  const confirm = document.getElementById(`actions-confirm-${id}`);
  confirm.classList.remove("hidden");
  confirm.classList.add("flex");
}

/**
 * Reverts the UI state for a table row, hiding confirmation buttons
 */
function cancelConfirmation(id) {
  const confirm = document.getElementById(`actions-confirm-${id}`);
  confirm.classList.add("hidden");
  confirm.classList.remove("flex");
  document.getElementById(`actions-default-${id}`).classList.remove("hidden");
}

/**
 * Sends an asynchronous request to delete a media item.
 */
async function confirmDelete(id) {
  try {
    const response = await fetch("/admin/manage/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // currentCsrfToken is defined globally in the EJS template
      body: JSON.stringify({ media_id: id, csrf_token: currentCsrfToken }),
    });
    const data = await response.json();
    if (data.success) {
      // Update CSRF token for subsequent requests
      currentCsrfToken = data.csrf;
      // Remove row from table
      document.getElementById(`actions-default-${id}`).closest(".project-row").remove();
    } else {
      alert("Error: " + data.message);
      cancelConfirmation(id);
    }
  } catch (error) {
    alert("System error.");
    cancelConfirmation(id);
  }
}
