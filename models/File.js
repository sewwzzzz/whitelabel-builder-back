const db = require("../config/database");

class File {
  /**
   * 创建或更新文件记录
   * @param {Object} fileData - 文件数据
   */
  static async upsert(fileData) {
    const sql = `
      INSERT INTO files (
        id, filename, size, created_at, mime_type, 
        is_image, width, height, color_space, channels
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        filename = VALUES(filename),
        size = VALUES(size),
        mime_type = VALUES(mime_type),
        is_image = VALUES(is_image),
        width = VALUES(width),
        height = VALUES(height),
        color_space = VALUES(color_space),
        channels = VALUES(channels)
    `;

    const params = [
      fileData.id,
      fileData.filename,
      fileData.size,
      fileData.created_at,
      fileData.mime_type,
      fileData.is_image,
      fileData.width || null,
      fileData.height || null,
      fileData.color_space || null,
      fileData.channels || null,
    ];

    try {
      const result = await db.query(sql, params);
      return result;
    } catch (error) {
      console.error("保存文件信息到数据库时出错:", error);
      throw error;
    }
  }

  /**
   * 根据ID查找文件
   * @param {string} id - 文件ID
   * @returns {Object|null}
   */
  static async findById(id) {
    const sql = `
      SELECT 
        id, filename, size, created_at, mime_type, 
        is_image, width, height, color_space, channels
      FROM files WHERE id = ?
    `;
    
    try {
      const results = await db.query(sql, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("获取文件信息时出错:", error);
      throw error;
    }
  }

  /**
   * 获取文件列表
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Array<Object>}
   */
  static async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        id, filename, size, created_at, mime_type, 
        is_image, width, height, color_space, channels
      FROM files 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    try {
      const results = await db.query(sql, [limit, offset]);
      return results;
    } catch (error) {
      console.error("获取文件列表时出错:", error);
      throw error;
    }
  }

  /**
   * 根据ID删除文件
   * @param {string} id - 文件ID
   */
  static async deleteById(id) {
    const sql = "DELETE FROM files WHERE id = ?";
    
    try {
      const result = await db.query(sql, [id]);
      return result;
    } catch (error) {
      console.error("删除文件信息时出错:", error);
      throw error;
    }
  }
}

module.exports = File;