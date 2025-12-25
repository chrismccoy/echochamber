/**
 * Initialization Service.
 *
 * This ensures that all necessary directory structures exist (data, uploads, assets)
 * and that required database files are created with default structures if they are missing.
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");

/**
 * Class responsible for running startup checks and setup tasks.
 */
class InitService {
  /**
   * Defines the required directory structure and default file contents.
   */
  constructor() {
    /**
     * List of absolute paths to directories that must exist.
     */
    this.directories = [
      config.paths.data,
      config.uploads.directory,
      path.join(config.paths.public, "assets", "css"),
      path.join(config.paths.public, "assets", "js"),
      path.join(config.paths.views, "content"),
    ];

    /**
     * Map of filenames to their default JSON content.
     */
    this.defaultFiles = {
      "database.json": [],
    };
  }

  /**
   * Executes the initialization process.
   */
  initialize() {
    console.log("Application Init...");
    this._createDirectories();
    this._createDefaultFiles();
    console.log("Init Complete...\n");
  }

  /**
   * Iterates through the configured directories and creates them recursively
   * if they do not already exist.
   */
  _createDirectories() {
    for (const dir of this.directories) {
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Iterates through the configured default files. If a file does not exist
   * in the data directory, it creates it with the specified default JSON content.
   */
  _createDefaultFiles() {
    for (const [filename, content] of Object.entries(this.defaultFiles)) {
      const filePath = path.join(config.paths.data, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`Creating default file: ${filename}`);
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4), "utf-8");
      }
    }
  }
}

module.exports = new InitService();
