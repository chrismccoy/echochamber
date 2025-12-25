/**
 * JSON Storage Service.
 *
 * Provides reading and writing JSON data to the filesystem.
 * Handles file checks and error management, ensuring the application
 * receives default data structures (arrays or objects) even if files are missing.
 */

const fs = require("fs").promises;
const path = require("path");
const config = require("../config");

/**
 */
class JsonStorageService {
  /**
   * Initialize the storage service with the configured data directory.
   */
  constructor() {
    /**
     * The absolute path to the directory where JSON files are stored.
     */
    this.dataDir = config.paths.data;
  }

  /**
   * Reads and decodes a JSON file from the data directory.
   */
  async read(filename) {
    const filePath = path.join(this.dataDir, filename);
    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(
        `Could not read ${filename}. Returning default value. Error: ${error.message}`
      );
      // Default to array for database.json, object for anything else
      return filename === "database.json" ? [] : {};
    }
  }

  /**
   * Encodes data to a JSON string and saves it to a file.
   */
  async write(filename, data) {
    const filePath = path.join(this.dataDir, filename);
    // Use 4-space indentation for human readability
    const jsonData = JSON.stringify(data, null, 4);
    try {
      await fs.writeFile(filePath, jsonData, "utf-8");
      return true;
    } catch (error) {
      console.error(`Failed to write to ${filename}:`, error);
      return false;
    }
  }
}

module.exports = new JsonStorageService();
