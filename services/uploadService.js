const File = require("../models/File");
const fs = require("fs").promises;
const path = require("path");
const imageSize = require("image-size");
const sharp = require("sharp");

class UploadService {
  /**
   * 处理上传完成的文件
   * @param {Object} upload - 上传对象
   */
  async processUpload(upload) {
    try {
      const uploadDir = path.join(__dirname, "..", "uploads");
      const filePath = path.join(uploadDir, upload.id);

      // 检查文件是否存在
      await fs.access(filePath);

      // 获取文件基本信息
      const stats = await fs.stat(filePath);
      
      // 解析文件扩展名
      const extension = path.extname(upload.id).toLowerCase();
      
      // 创建文件记录
      const fileRecord = {
        id: upload.id,
        filename: upload.metadata.filename || upload.id,
        size: stats.size,
        created_at: new Date(),
        mime_type: this.getMimeType(extension),
        is_image: this.isImage(extension),
      };

      // 如果是图片，获取图片信息
      if (fileRecord.is_image) {
        const imageInfo = await this.getImageInfo(filePath);
        Object.assign(fileRecord, imageInfo);
      }

      // 保存到数据库
      await File.upsert(fileRecord);

      return fileRecord;
    } catch (error) {
      console.error("处理上传文件时出错:", error);
      throw error;
    }
  }

  /**
   * 根据扩展名判断是否为图片
   * @param {string} extension - 文件扩展名
   * @returns {boolean}
   */
  isImage(extension) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    return imageExtensions.includes(extension);
  }

  /**
   * 根据扩展名获取 MIME 类型
   * @param {string} extension - 文件扩展名
   * @returns {string}
   */
  getMimeType(extension) {
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".bmp": "image/bmp",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    return mimeTypes[extension] || "application/octet-stream";
  }

  /**
   * 获取图片信息（尺寸、颜色空间等）
   * @param {string} filePath - 文件路径
   * @returns {Object}
   */
  async getImageInfo(filePath) {
    try {
      // 使用 image-size 获取基本尺寸信息
      const dimensions = imageSize(filePath);
      
      // 使用 sharp 获取更详细的图像信息
      const metadata = await sharp(filePath).metadata();
      
      return {
        width: dimensions.width,
        height: dimensions.height,
        color_space: metadata.space, // RGB, CMYK等
        channels: metadata.channels,
      };
    } catch (error) {
      console.error("获取图片信息时出错:", error);
      return {
        width: null,
        height: null,
        color_space: null,
        channels: null,
      };
    }
  }


  /**
   * 根据文件ID获取文件信息
   * @param {string} fileId - 文件ID
   * @returns {Object|null}
   */
  async getFileInfo(fileId) {
    try {
      return await File.findById(fileId);
    } catch (error) {
      console.error("获取文件信息时出错:", error);
      throw error;
    }
  }
  
  /**
   * 获取所有文件信息（分页）
   * @param {number} page - 页码，默认为1
   * @param {number} limit - 每页数量，默认为20
   * @returns {Array<Object>}
   */
  async getAllFiles(page = 1, limit = 20) {
    try {
      return await File.findAll(page, limit);
    } catch (error) {
      console.error("获取文件列表时出错:", error);
      throw error;
    }
  }
}

module.exports = new UploadService();