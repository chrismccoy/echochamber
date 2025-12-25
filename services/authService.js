/**
 * Auth Service
 *
 * Manages admin auth
 * Currently utilizes a simple PIN-based verification system against
 * server-side configuration.
 */

const config = require("../config");

/**
 * Class for Auth
 */
class AuthService {
  /**
   * Verifies a submitted PIN against the environment configuration.
   */
  async login(pin) {
    if (!pin) return false;
    return pin === config.admin.pin;
  }
}

module.exports = new AuthService();
