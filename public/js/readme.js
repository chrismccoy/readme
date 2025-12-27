/**
 * Initializes the client-side logic once the DOM is fully loaded.
 * Sets up event listeners for the form and handles UI state changes.
 */
document.addEventListener("DOMContentLoaded", () => {
  const ui = {
    form: document.getElementById("readmeForm"),
    input: document.getElementById("repoUrl"),
    submitBtn: document.getElementById("submitBtn"),
    contentArea: document.getElementById("contentArea"),
    markdownOutput: document.getElementById("markdownOutput"),
    closeBtn: document.getElementById("closeBtn"),
    errorMsg: document.getElementById("errorMsg"),
  };

  /**
   * Toggles the UI loading state.
   */
  const toggleLoading = (isLoading) => {
    if (isLoading) {
      ui.submitBtn.disabled = true;
      ui.errorMsg.classList.add("hidden");

      // Reveal the container area
      ui.contentArea.classList.remove("hidden");

      // Clear previous content so the spinner shows clearly
      ui.markdownOutput.innerHTML = "";

      // Add the CSS class that injects the spinner
      ui.contentArea.classList.add("is-loading");
    } else {
      ui.submitBtn.disabled = false;
      // Remove the CSS spinner
      ui.contentArea.classList.remove("is-loading");
    }
  };

  /**
   * Displays an error message to the user and hides the content area.
   */
  const showError = (message) => {
    ui.errorMsg.textContent = message;
    ui.errorMsg.classList.remove("hidden");
    ui.contentArea.classList.add("hidden");
  };

  /**
   * Resets the entire view to its initial state.
   */
  const resetView = () => {
    ui.contentArea.classList.add("hidden");
    ui.markdownOutput.innerHTML = "";
    ui.errorMsg.classList.add("hidden");
    ui.input.value = "";
  };

  // Bind Close Button
  ui.closeBtn.addEventListener("click", resetView);

  /**
   * Handles the Form Submission event.
   * Validates input, triggers the API call, and updates the UI.
   */
  ui.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = ui.input.value.trim();
    if (!url) return;

    toggleLoading(true);

    try {
      const res = await fetch("/api/fetch-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }

      // Render HTML
      ui.markdownOutput.innerHTML = data.html;
    } catch (err) {
      showError(err.message);
    } finally {
      // Remove the spinner
      toggleLoading(false);
    }
  });
});
