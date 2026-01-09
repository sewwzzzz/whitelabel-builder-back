const mysql = require("mysql2/promise");
require("dotenv").config();

class Database {
  constructor() {
    this.pool = null;
    this.init();
  }

  init() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("数据库连接池创建成功");

      // 初始化数据库表
      this.initTables();
    } catch (error) {
      console.error("数据库连接池创建失败:", error);
      throw error;
    }
  }

  async initTables() {
    // 删除旧的files表（如果有）
    const dropTableSQL = `DROP TABLE IF EXISTS files`;

    // 创建新的files表
    const createFilesTableSQL = `
      CREATE TABLE files (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        created_at DATETIME NOT NULL,
        mime_type VARCHAR(100),
        is_image BOOLEAN DEFAULT FALSE,
        width INT NULL,
        height INT NULL,
        color_space VARCHAR(20) NULL,
        channels TINYINT NULL,
        INDEX idx_created_at (created_at),
        INDEX idx_is_image (is_image)
      )
    `;

    try {
      await this.pool.execute(dropTableSQL);
      await this.pool.execute(createFilesTableSQL);
      console.log("文件表创建成功");
    } catch (error) {
      console.error("创建文件表时出错:", error);
      throw error;
    }
  }

  async getConnection() {
    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (error) {
      console.error("获取数据库连接失败:", error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error("数据库查询失败:", error);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new Database();