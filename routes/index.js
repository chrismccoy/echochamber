/**
 * Public Router.
 */

const express = require("express");
const multer = require("multer");
const config = require("../config");
const pageController = require("../controllers/pageController");

const router = express.Router();

/**
 * Multer Upload Configuration for Public Uploads.
 * Configured to save files to the uploads directory with size limits defined in config.
 * Restricts uploads to specific audio and video MIME types.
 */
const upload = multer({
  dest: config.uploads.directory,
  limits: { fileSize: config.uploads.max_size_bytes },
  fileFilter: (req, file, cb) => {
    // Allow Audio and Video
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
      cb(new Error("Invalid file type. Allowed: MP3, WAV, MP4, WebM."), false);
    }
  },
});

/**
 * Renders the homepage with the upload form.
 */
router.get("/", pageController.getHomePage);

/**
 * Handles the public file upload.
 */
router.post("/upload", upload.single("media"), pageController.handleUpload);

/**
 * Renders the media player page for Audio files.
 */
router.get("/a/:mediaId", pageController.getWatchPage);

/**
 * Renders the media player page for Video files.
 */
router.get("/v/:mediaId", pageController.getWatchPage);

/**
 * Renders the static Privacy Policy page.
 */
router.get("/page/privacy", pageController.getPrivacyPage);

/**
 * Renders the static Terms of Service page.
 */
router.get("/page/tos", pageController.getTosPage);

module.exports = router;
