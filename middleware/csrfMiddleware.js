/**
 * CSRF Protection Middleware.
 *
 * Verifies that the CSRF token submitted in the request body matches the token
 * stored in the user's session. This prevents Cross-Site Request Forgery attacks.
 */

const crypto = require("crypto");

/**
 * Validates the CSRF token.
 */
function csrfMiddleware(req, res, next) {
  if (
    req.body.csrf_token &&
    req.body.csrf_token === req.session.csrf_token
  ) {
    // Rotate token on successful usage
    req.session.csrf_token = crypto.randomBytes(32).toString("hex");
    // Make new token available to views immediately if needed
    res.locals.csrf_token = req.session.csrf_token;
    return next();
  }

  res.status(403).send("CSRF token validation failed.");
}

module.exports = csrfMiddleware;

