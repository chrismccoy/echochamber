/**
 * Admin Controller.
 *
 * Manages all admin routes, including auth, dashboard visualization,
 * media management, and admin file uploads.
 */

const asyncHandler = require("express-async-handler");
const mediaService = require("../services/mediaService");
const authService = require("../services/authService");
const config = require("../config");

/**
 * Renders the Admin Login page.
 * Redirects to the dashboard if a valid session already exists.
 */
const getLoginPage = (req, res) => {
  if (req.session.isLoggedIn) return res.redirect("/admin");
  res.render("admin/login", { error: null });
};

/**
 * Processes the Admin Login form submission.
 * Verifies the submitted PIN against the configuration.
 */
const handleLogin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const success = await authService.login(pin);
  if (success) {
    req.session.isLoggedIn = true;
    req.session.save(() => res.redirect("/admin"));
  } else {
    res.status(401).render("admin/login", { error: "Incorrect PIN." });
  }
});

/**
 * Logs the admin out by destroying the current session.
 */
const getLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
};

/**
 * Renders the Dashboard.
 * Serves the layout which loads stats via API calls.
 */
const getDashboard = (req, res) => {
  res.render("admin/layout", {
    title: "Dashboard",
    contentPartial: "dashboard",
    data: {},
  });
};

/**
 * Retrieves dashboard statistics.
 * Returns JSON data for upload counts, popular files, and total usage.
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await mediaService.getDashboardStats();
  res.json(stats);
});

/**
 * Renders the Media Management.
 * Handles pagination and sorting of the media library.
 */
const getManageMedia = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const sort = req.query.sort || "newest";
  const mediaData = await mediaService.getAllMediaWithDetails(sort, page);
  res.render("admin/layout", {
    title: "Manage Media",
    contentPartial: "manage_media",
    data: { ...mediaData, sort_order: sort },
  });
});

/**
 * Renders the Admin Upload.
 */
const getUploadPage = (req, res) => {
  res.render("admin/layout", {
    title: "Upload Media",
    contentPartial: "upload",
    data: {
      max_file_size: config.uploads.max_size_bytes,
      max_file_size_text: config.uploads.limit_text,
    },
  });
};

/**
 * Handles file uploads from the Admin panel.
 */
const handleAdminUpload = asyncHandler(async (req, res) => {
  const result = await mediaService.handleUpload(req.file);
  res.json(result);
});

/**
 * Handles requests to delete a specific media file.
 * Removes the file from the filesystem and the database.
 */
const deleteMedia = asyncHandler(async (req, res) => {
  const { media_id } = req.body;
  const success = await mediaService.deleteMedia(media_id);
  if (success) {
    res.json({
      success: true,
      message: "Deleted.",
      csrf: res.locals.csrf_token,
    });
  } else {
    res.status(404).json({ success: false, message: "Not found." });
  }
});

module.exports = {
  getLoginPage,
  handleLogin,
  getLogout,
  getDashboard,
  getStats,
  getManageMedia,
  getUploadPage,
  handleAdminUpload,
  deleteMedia,
};
