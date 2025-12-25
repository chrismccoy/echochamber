/**
 * Authentication Middleware.
 *
 * Checks if the user has an active session indicating they are logged in.
 * If authentication fails:
 * - Returns a 403 JSON error for API requests.
 * - Redirects to the login page for standard browser requests.
 */
function authMiddleware(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  }

  // If request is for an API endpoint, return JSON error instead of redirect
  if (req.path.startsWith("/api/")) {
    return res.status(403).json({ error: "Authentication required." });
  }

  res.redirect("/admin/login");
}

module.exports = authMiddleware;

