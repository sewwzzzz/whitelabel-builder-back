const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

class FileUtils {
  /**
   * 生成文件的MD5哈希值
   * @param {string} filePath - 文件路径
   * @returns {Promise<string>} MD5哈希值
   */
  static async generateMD5(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("md5");
      const stream = fs.createReadStream(filePath);
      
      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", (err) => reject(err));
    });
  }

  /**
   * 根据文件内容和原始文件名生成唯一标识符
   * @param {string} filePath - 文件路径
   * @param {string} originalFilename - 原始文件名
   * @returns {Promise<string>} 唯一标识符 (md5.扩展名)
   */
  static async generateUniqueIdentifier(filePath, originalFilename) {
    try {
      const md5 = await this.generateMD5(filePath);
      const extension = path.extname(originalFilename).toLowerCase();
      return extension ? `${md5}${extension}` : md5;
    } catch (error) {
      throw new Error(`生成文件唯一标识符失败: ${error.message}`);
    }
  }
}

module.exports = FileUtils;