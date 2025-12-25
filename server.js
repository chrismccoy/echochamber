/**
 * Echo Chamber Application
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const config = require("./config");
const initService = require("./services/initService");

const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");

/**
 * Runs startup checks to ensure data directories and default JSON database files exist.
 */
initService.initialize();

const app = express();

app.set("view engine", "ejs");
app.set("views", config.paths.views);

// Middleware Configuration
app.use(express.static(config.paths.public));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Session Configuration.
 */
app.use(
  session({
    secret: config.session.secret,
    name: config.session.name,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

/**
 * Middleware for Template Variables & CSRF.
 */
app.use((req, res, next) => {
  if (!req.session.csrf_token) {
    req.session.csrf_token = crypto.randomBytes(32).toString("hex");
  }
  // Expose session status, config, and CSRF token to all views
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.config = config;
  res.locals.csrf_token = req.session.csrf_token;
  next();
});

/**
 * Routes
 */
app.use("/", indexRoutes);
app.use("/admin", adminRoutes);

/**
 * 404 Middleware
 */
app.use((req, res, next) => {
  res.status(404).render("404", { seo: config.seo });
});

/**
 * Global Error Middleware
 */
app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:", err);
  res.status(err.status || 500).render("error", {
    seo: config.seo,
    error: {
      status: err.status || 500,
      message:
        process.env.NODE_ENV === "production" ? "Server Error" : err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
  });
});

/**
 * Woot
 */
app.listen(config.server.port, () => {
  console.log(`Server is running on http://localhost:${config.server.port}`);
});
