const uploadService = require("../services/uploadService");

class FileController {
  /**
   * 获取单个文件信息
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getFile(req, res) {
    try {
      const { id } = req.params;
      const fileInfo = await uploadService.getFileInfo(id);

      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          message: "文件未找到",
        });
      }

      res.json({
        success: true,
        data: fileInfo,
      });
    } catch (error) {
      console.error("获取文件信息时出错:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  /**
   * 获取文件列表
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getFiles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const files = await uploadService.getAllFiles(page, limit);
      
      res.json({
        success: true,
        data: files,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("获取文件列表时出错:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
  
  /**
   * 删除文件
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      
      // 先查找文件
      const fileInfo = await uploadService.getFileInfo(id);
      
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          message: "文件未找到",
        });
      }
      
      // 从数据库删除
      const File = require("../models/File");
      await File.deleteById(id);
      
      // 从磁盘删除文件
      const fs = require("fs").promises;
      const path = require("path");
      const filePath = path.join(__dirname, "..", "uploads", id);
      await fs.unlink(filePath).catch(() => {}); // 忽略文件不存在的错误
      
      res.json({
        success: true,
        message: "文件删除成功",
      });
    } catch (error) {
      console.error("删除文件时出错:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
}

module.exports = new FileController();