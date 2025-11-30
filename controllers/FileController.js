class FileController {
  constructor(fileService) {
    this.fileService = fileService;
  }

  async saveFileInfo(req, res) {
    try {
      const fileData = req.body;

      // 基本数据验证
      if (!fileData || Object.keys(fileData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "请求数据不能为空",
        });
      }

      // 验证必需字段
      const requiredFields = ["name", "type", "size", "lastModified"];
      const missingFields = requiredFields.filter((field) => !fileData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必需字段: ${missingFields.join(", ")}`,
        });
      }

      const result = await this.fileService.saveFile(fileData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("控制器错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        error: error.message,
      });
    }
  }

  async getFileInfo(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "无效的文件ID",
        });
      }

      const result = await this.fileService.getFileById(parseInt(id));

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("获取文件信息错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  async getFileList(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const result = await this.fileService.getAllFiles(
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("获取文件列表错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
}

module.exports = FileController;
