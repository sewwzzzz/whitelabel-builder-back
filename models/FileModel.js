class FileModel {
  constructor(db) {
    this.db = db;
  }

  async createTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS files (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100) NOT NULL,
                size BIGINT NOT NULL,
                lastModified DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

    await this.db.query(sql);
    console.log("文件表创建成功或已存在");
  }

  async create(fileData) {
    const sql = `
            INSERT INTO files (name, type, size, lastModified)
            VALUES (?, ?, ?, ?)
        `;

    const params = [
      fileData.name,
      fileData.type,
      fileData.size,
      fileData.lastModified,
    ];

    const result = await this.db.query(sql, params);
    return {
      id: result.insertId,
      ...fileData,
    };
  }

  async findById(id) {
    const sql = "SELECT * FROM files WHERE id = ?";
    const files = await this.db.query(sql, [id]);
    return files.length > 0 ? files[0] : null;
  }

  async findAll(limit = 100, offset = 0) {
    const sql = "SELECT * FROM files ORDER BY created_at DESC LIMIT ? OFFSET ?";
    return await this.db.query(sql, [limit, offset]);
  }

  async deleteById(id) {
    const sql = "DELETE FROM files WHERE id = ?";
    const result = await this.db.query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = FileModel;
