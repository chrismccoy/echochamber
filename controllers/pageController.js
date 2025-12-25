/**
 * Page Controller.
 *
 * Manages public views, including the homepage,
 * media player, file uploads, and static content pages.
 */

const fs = require("fs").promises;
const path = require("path");
const asyncHandler = require("express-async-handler");
const mediaService = require("../services/mediaService");
const config = require("../config");

/**
 * Renders the Homepage.
 */
const getHomePage = asyncHandler(async (req, res) => {
  res.render("home", { seo: config.seo });
});

/**
 * Handles public media uploads via AJAX
 * Processes the uploaded file and returns JSON status, including the mimetype
 * so the client knows which URL to redirect to.
 */
const handleUpload = asyncHandler(async (req, res) => {
  const result = await mediaService.handleUpload(req.file);
  if (result.success) {
    // Return mimetype so client handles routing (Audio vs Video)
    res.json(result);
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

/**
 * Renders the Media Player page
 *
 * - Videos must be viewed at /v/:id
 * - Audio must be viewed at /a/:id
 * - Redirects automatically if the wrong route is used.
 */
const getWatchPage = asyncHandler(async (req, res, next) => {
  const mediaId = req.params.mediaId;
  const media = await mediaService.getMediaById(mediaId);

  // If media not found, invoke standard 404 handling via next()
  if (!media) return next();

  const isVideo = media.mimetype.startsWith("video");
  const isAudio = !isVideo;

  // Strict Routing
  // Check if the current request path starts with /v/ but the file is audio, or vice versa

  // If accessing video content via /a/ route
  if (isVideo && !req.originalUrl.includes("/v/")) {
    return res.redirect(`/v/${mediaId}`);
  }

  // If accessing audio content via /v/ route
  if (isAudio && !req.originalUrl.includes("/a/")) {
    return res.redirect(`/a/${mediaId}`);
  }

  const plays = await mediaService.incrementPlayCount(mediaId);

  // Create a copy of SEO config to customize for this page
  const seo = { ...config.seo };

  // Dynamic verb based on media type
  const actionVerb = isVideo ? "Watch" : "Listen to";

  seo.title = `${media.original_filename} - ${config.site.title}`;
  seo.description = `${actionVerb} ${media.original_filename} on ${config.site.title}`;

  // Generate URL based on type
  const typePrefix = isVideo ? "v" : "a";
  const currentUrl = `${config.site.url}/${typePrefix}/${mediaId}`;

  res.render("media_player", {
    seo,
    media,
    plays,
    currentUrl,
    isVideo,
  });
});

/**
 * Renders a static HTML page content wrapped in the application layout.
 * Used for Privacy Policy, Terms of Service, etc.
 */
const renderStaticPage = async (res, next, pageName, title) => {
  try {
    const contentPath = path.join(
      config.paths.views,
      "content",
      `${pageName}.html`
    );
    const content = await fs.readFile(contentPath, "utf8");
    const seo = { ...config.seo };
    seo.title = `${title} - ${config.site.title}`;
    res.render("static_page", { title, content, seo });
  } catch (error) {
    if (error.code === "ENOENT") return next(); // 404 if file missing
    next(error); // Pass other errors to global handler
  }
};

/**
 * Renders the Privacy Policy page.
 */
const getPrivacyPage = (req, res, next) =>
  renderStaticPage(res, next, "privacy", "Privacy Policy");

/**
 * Renders the Terms of Service page.
 */
const getTosPage = (req, res, next) =>
  renderStaticPage(res, next, "tos", "Terms of Service");

module.exports = {
  getHomePage,
  handleUpload,
  getWatchPage,
  getPrivacyPage,
  getTosPage,
};
