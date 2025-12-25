/**
 * Media Service.
 *
 * Handles managing audio and video files.
 * Processing uploads, retrieving metadata, calculating statistics,
 * incrementing play counts, and performing deletions from both disk and database.
 */

const crypto = require("crypto");
const path = require("path");
const fs = require("fs").promises;
const jsonStorage = require("./jsonStorageService");
const config = require("../config");

/** The filename of the main database JSON file. */
const DB_FILE = "database.json";

class MediaService {
  constructor() {
    /**
     * Directory where uploaded media files are stored.
     */
    this.uploadDir = config.uploads.directory;
  }

  /**
   * Processes a media upload.
   *
   * Renames the temporary file provided by Multer to a unique ID, moves it to the
   * public upload directory, and creates a metadata entry in the JSON database.
   */
  async handleUpload(file) {
    if (!file) {
      return { success: false, message: "No file was uploaded." };
    }

    // Generate unique ID
    const uniqueId = crypto.randomBytes(4).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    const newFilename = `${uniqueId}${ext}`;

    const oldPath = file.path;
    const newPath = path.join(this.uploadDir, newFilename);

    try {
      // Move file from temp to public
      await fs.rename(oldPath, newPath);
    } catch (error) {
      console.error("Error moving file:", error);
      await fs
        .unlink(oldPath)
        .catch((err) => console.error("Cleanup fail:", err));
      return { success: false, message: "Server error processing file." };
    }

    const newTrack = {
      id: uniqueId,
      filename: newFilename,
      original_filename: file.originalname,
      mimetype: file.mimetype,
      upload_time: Math.floor(Date.now() / 1000),
      plays: 0,
    };

    const database = await jsonStorage.read(DB_FILE);
    database.push(newTrack);
    await jsonStorage.write(DB_FILE, database);

    // Return mimetype so controller can determine redirect URL
    return { success: true, id: uniqueId, mimetype: file.mimetype };
  }

  /**
   * Retrieves a specific media item by its unique ID.
   * Verifies that the file exists on the filesystem before returning metadata.
   */
  async getMediaById(id) {
    const database = await jsonStorage.read(DB_FILE);
    const media = database.find((a) => a.id === id);

    if (media) {
      const filePath = path.join(this.uploadDir, media.filename);
      try {
        await fs.access(filePath);
        return media;
      } catch (e) {
        return null; // File missing from disk
      }
    }
    return null;
  }

  /**
   * Retrieves a paginated and sorted list of media items.
   * dynamically generates the 'url' property based on mimetype.
   */
  async getAllMediaWithDetails(sortBy = "newest", page = 1, perPage = 10) {
    const database = await jsonStorage.read(DB_FILE);

    database.sort((a, b) => {
      if (sortBy === "newest")
        return (b.upload_time || 0) - (a.upload_time || 0);
      if (sortBy === "oldest")
        return (a.upload_time || 0) - (b.upload_time || 0);
      return 0;
    });

    const totalItems = database.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const offset = (page - 1) * perPage;

    // Items with the correct URL based on type
    const tracks = database
      .slice(offset, offset + perPage)
      .map((m) => ({
        ...m,
        url: `${config.site.url}/${m.mimetype.startsWith("video") ? "v" : "a"}/${m.id}`,
      }));

    return {
      media_tracks: tracks,
      total_pages: totalPages,
      current_page: page,
    };
  }

  /**
   * Deletes a media file from disk and removes its entry from the database.
   */
  async deleteMedia(id) {
    const database = await jsonStorage.read(DB_FILE);
    const index = database.findIndex((a) => a.id === id);

    if (index === -1) return false;

    const item = database[index];
    const filePath = path.join(this.uploadDir, item.filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`File delete failed, removing DB entry anyway: ${filePath}`);
    }

    database.splice(index, 1);
    await jsonStorage.write(DB_FILE, database);
    return true;
  }

  /**
   * Increments the play/view count for a specific media item.
   */
  async incrementPlayCount(id) {
    const database = await jsonStorage.read(DB_FILE);
    const item = database.find((a) => a.id === id);
    if (item) {
      item.plays = (item.plays || 0) + 1;
      await jsonStorage.write(DB_FILE, database);
      return item.plays;
    }
    return 0;
  }

  /**
   * Compiles statistics for the admin dashboard.
   */
  async getDashboardStats() {
    const database = await jsonStorage.read(DB_FILE);

    // Calculate Popular (Sort by plays descending)
    const topPopular = [...database]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        plays: m.plays || 0,
        // Dynamic URL generation
        url: `${config.site.url}/${m.mimetype.startsWith("video") ? "v" : "a"}/${m.id}`,
        original_filename: m.original_filename,
        is_video: m.mimetype.startsWith("video"),
      }));

    // Calculate Newest
    const newest = [...database]
      .sort((a, b) => (b.upload_time || 0) - (a.upload_time || 0))
      .slice(0, 5)
      .map((m) => ({
        ...m,
        url: `${config.site.url}/${m.mimetype.startsWith("video") ? "v" : "a"}/${m.id}`,
        is_video: m.mimetype.startsWith("video"),
      }));

    const uploadCounts = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      uploadCounts[d.toISOString().split("T")[0]] = 0;
    }
    database.forEach((m) => {
      const date = new Date((m.upload_time || 0) * 1000)
        .toISOString()
        .split("T")[0];
      if (uploadCounts.hasOwnProperty(date)) uploadCounts[date]++;
    });

    return {
      total_media: database.length,
      top_popular_media: topPopular,
      newest_media: newest,
      upload_stats: {
        labels: Object.keys(uploadCounts).reverse(),
        data: Object.values(uploadCounts).reverse(),
      },
    };
  }
}

module.exports = new MediaService();
