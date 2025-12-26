/**
 * Application Config
 *
 * This configures all application settings, including server ports,
 * directory paths, upload limits, SEO metadata, and security secrets.
 */

require("dotenv").config();

const path = require("path");

module.exports = {
  site: {
    title: process.env.SITE_TITLE || "Echo Chamber",
    url: process.env.SITE_URL || "http://localhost:3000",
    showAdminLogin: process.env.SHOW_ADMIN_LOGIN !== "false",
  },

  seo: {
    title: process.env.SITE_TITLE || "Echo Chamber Media",
    description: process.env.SITE_DESCRIPTION || "Simple media hosting.",
    keywords: process.env.SITE_KEYWORDS || "video, audio, hosting",
    og_title: process.env.SITE_TITLE || "Echo Chamber",
    og_description: process.env.SITE_DESCRIPTION || "Simple media hosting.",
    og_url: process.env.SITE_URL || "http://localhost:3000",
    og_image: process.env.SITE_OG_IMAGE || "",
    favicon: process.env.SITE_FAVICON || "/assets/favicon.ico",
  },

  server: {
    port: process.env.PORT || 3000,
  },

  uploads: {
    // 500 MB limit in bytes
    max_size_bytes: 524288000,
    limit_text: "500MB Max limit upload.",
    directory: path.join(__dirname, "public", "uploads"),
    url_path: "/uploads/",
  },

  paths: {
    data: path.join(__dirname, "data"),
    public: path.join(__dirname, "public"),
    views: path.join(__dirname, "views"),
  },

  admin: {
    pin: process.env.ADMIN_PIN || "1234",
  },

  session: {
    secret: process.env.SESSION_SECRET || "default-insecure-secret",
    name: "mediahost.sid",
  },
};

