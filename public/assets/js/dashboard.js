/**
 * Admin Dashboard Script.
 *
 * Responsible for initializing the admin dashboard view.
 * Fetches statistical data from the internal API and renders:
 * - Total media counts.
 * - Lists for popular and recent media.
 * - A bar chart visualizing upload frequency over the last 30 days.
 */

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Fetches dashboard statistics from the server and updates the DOM.
   */
  async function loadDashboardData() {
    try {
      const response = await fetch("/admin/api/stats");
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();

      // Update Total Counter
      document.getElementById(
        "totalMedia"
      ).textContent = `${data.total_media} Files`;

      /**
       * Helper function to render a list of media items into a container.
       */
      const renderList = (elementId, items) => {
        const el = document.getElementById(elementId);
        el.innerHTML = "";

        if (!items?.length) {
          el.innerHTML = '<div class="text-sm text-gray-500">No data.</div>';
          return;
        }

        items.forEach((item) => {
          // Determine icon based on media type
          const icon = item.is_video ? "bi-film" : "bi-music-note";
          const itemDiv = document.createElement("div");
          itemDiv.className = "flex justify-between items-center text-sm mb-2";

          itemDiv.innerHTML = `
              <div class="flex items-center truncate pr-2">
                 <i class="bi ${icon} text-gray-400 mr-2"></i>
                 <a href="${
                   item.url
                 }" target="_blank" class="font-mono text-gray-700 hover:text-indigo-600 truncate" title="${
            item.original_filename
          }">${item.original_filename}</a>
              </div>
              ${
                item.plays !== undefined
                  ? `<span class="text-gray-500 font-medium flex-shrink-0">${item.plays} Plays</span>`
                  : ""
              }
            `;
          el.appendChild(itemDiv);
        });
      };

      // Render the specific lists
      renderList("mostPopularList", data.top_popular_media);
      renderList("newMediaList", data.newest_media);

      // Render the Chart.js graph if data exists
      if (data.upload_stats) renderChart(data.upload_stats);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }

  /**
   * Renders the Upload Activity bar chart using Chart.js.
   */
  function renderChart(chartData) {
    const ctx = document.getElementById("mediaChart")?.getContext("2d");
    if (!ctx) return;

    // Initialize Chart.js instance
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Uploads",
            data: chartData.data,
            backgroundColor: "rgba(79, 70, 229, 0.6)", // Indigo-600 with opacity
            borderColor: "rgba(79, 70, 229, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }, // Ensure whole numbers only
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  // Initialize data loading
  loadDashboardData();
});
