/**
 * AJAX File Uploader.
 *
 * Provides a drag-and-drop file upload interface.
 * Handles validation, progress tracking, and UI updates
 */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form[data-upload-form]").forEach(setupUploader);
});

/**
 * Upload Init
 */
function setupUploader(form) {
  const input = form.querySelector('input[type="file"]');
  const dropZone = form.querySelector("[data-drop-zone]");
  const progressContainer = document.getElementById(
    form.dataset.progressContainer
  );
  const progressBar = document.getElementById(form.dataset.progressBar);
  const percentageText = document.getElementById(form.dataset.percentageText);
  const filenameText = document.getElementById(form.dataset.filenameText);
  const errorText = document.getElementById(form.dataset.errorText);
  const successText = document.getElementById(form.dataset.successText);

  const maxFileSize = parseInt(form.dataset.maxSize, 10);
  const uploadUrl = form.action;
  const csrfToken = form.querySelector('input[name="csrf_token"]')?.value;
  // Capture the specific redirect URL for this form (if any)
  const successRedirect = form.dataset.successRedirect;

  /**
   * Resets the uploader
   */
  const resetUploader = () => {
    form.classList.remove("hidden");
    progressContainer.classList.add("hidden");
    progressBar.style.width = "0%";
    percentageText.textContent = "0%";
    input.value = "";
  };

  /**
   * Displays an error message to the user.
   */
  const showError = (message) => {
    errorText.textContent = message;
    errorText.classList.remove("hidden");
  };

  /**
   * Hides all status messages (error and success).
   */
  const hideMessages = () => {
    errorText.classList.add("hidden");
    if (successText) successText.classList.add("hidden");
  };

  /**
   * Performs the file upload via XMLHttpRequest.
   */
  const uploadFile = (file) => {
    // Validation
    if (file.size > maxFileSize) {
      showError(
        `File is too large. Max size is ${Math.round(
          maxFileSize / 1024 / 1024
        )}MB.`
      );
      return;
    }

    hideMessages();
    form.classList.add("hidden");
    progressContainer.classList.remove("hidden");
    filenameText.textContent = `Uploading: ${file.name}`;

    const formData = new FormData();
    formData.append("media", file);
    if (csrfToken) formData.append("csrf_token", csrfToken);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl, true);

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = `${percent}%`;
        percentageText.textContent = `${percent}%`;
      }
    });

    // Handle response
    xhr.onload = function () {
      if (this.status >= 400) {
        showError("Upload failed.");
        resetUploader();
      } else {
        try {
          const response = JSON.parse(this.responseText);
          if (response.success) {
            if (successText) {
              successText.textContent = "Upload complete! Redirecting...";
              successText.classList.remove("hidden");
            }
            setTimeout(() => {
              // Redirect provided in HTML
              if (successRedirect && !successRedirect.includes("{id}")) {
                 window.location.href = successRedirect;
                 return;
              }

              // Routing based on mimetype
              const typePrefix =
                response.mimetype && response.mimetype.startsWith("video")
                  ? "v"
                  : "a";
              window.location.href = `/${typePrefix}/${response.id}`;
            }, 1500);
          } else {
            showError(response.message || "Error");
            resetUploader();
          }
        } catch (e) {
          showError("Invalid server response.");
          resetUploader();
        }
      }
    };

    xhr.onerror = function () {
      showError("Network error.");
      resetUploader();
    };

    xhr.send(formData);
  };

  // Handle file selection via standard input
  input.addEventListener("change", () => {
    if (input.files.length > 0) uploadFile(input.files[0]);
  });

  // Drag and Drop Event Handlers
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  ["dragenter", "dragover", "dragleave", "drop"].forEach((e) =>
    dropZone.addEventListener(e, preventDefaults)
  );

  ["dragenter", "dragover"].forEach((e) =>
    dropZone.addEventListener(e, () => dropZone.classList.add("dragover"))
  );

  ["dragleave", "drop"].forEach((e) =>
    dropZone.addEventListener(e, () => dropZone.classList.remove("dragover"))
  );

  // Handle Drop Event
  dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const type = files[0].type;
      // Type validation
      if (type.startsWith("audio/") || type.startsWith("video/")) {
        uploadFile(files[0]);
      } else {
        showError("Invalid file type. Video or Audio only.");
      }
    }
  });
}
