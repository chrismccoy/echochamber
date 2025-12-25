/**
 * Admin Router.
 *
 * - Public routes for login/logout.
 * - Protected routes for dashboard statistics, media management, and admin uploads.
 * - Auth and CSRF middleware.
 */

const express = require("express");
const multer = require("multer");
const config = require("../config");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const csrfMiddleware = require("../middleware/csrfMiddleware");

const router = express.Router();

/**
 * Multer Upload Configuration for Admin.
 * Configured to save files to the uploads directory with size limits defined in config.
 * Restricts uploads to specific audio and video MIME types.
 */
const upload = multer({
  dest: config.uploads.directory,
  limits: { fileSize: config.uploads.max_size_bytes },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."), false);
    }
  },
});

/**
 * Renders the admin login form.
 */
router.get("/login", adminController.getLoginPage);

/**
 * Processes login credentials (PIN).
 */
router.post("/login", adminController.handleLogin);

/**
 * Destroys session and redirects to login.
 */
router.get("/logout", adminController.getLogout);

// Apply authentication middleware to all the other routes
router.use(authMiddleware);

/**
 * Renders the main dashboard.
 */
router.get("/", adminController.getDashboard);

/**
 * Renders the media management table.
 */
router.get("/manage", adminController.getManageMedia);

/**
 * Deletes a media file. Requires CSRF token.
 */
router.post(
  "/manage/delete",
  express.json(),
  csrfMiddleware,
  adminController.deleteMedia
);

/**
 * Renders the admin upload form.
 */
router.get("/upload", adminController.getUploadPage);

/**
 * Handles file upload from admin. Requires Multer and CSRF token.
 */
router.post(
  "/upload",
  upload.single("media"),
  csrfMiddleware,
  adminController.handleAdminUpload
);

/**
 * Returns JSON statistics for the dashboard charts.
 */
router.get("/api/stats", adminController.getStats);

module.exports = router;
