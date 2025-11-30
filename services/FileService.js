class FileService {
  constructor(fileModel) {
    this.fileModel = fileModel;
  }

  async saveFile(fileData) {
    try {
      // 数据验证
      if (
        !fileData.name ||
        !fileData.type ||
        !fileData.size ||
        !fileData.lastModified
      ) {
        throw new Error("缺少必要的文件信息：name, type, size, lastModified");
      }

      // 验证数据类型
      if (typeof fileData.size !== "number" || fileData.size < 0) {
        throw new Error("文件大小必须为非负数");
      }

      // 转换lastModified为合适的格式
      const lastModified = new Date(fileData.lastModified);
      if (isNaN(lastModified.getTime())) {
        throw new Error("lastModified必须是有效的日期格式");
      }

      const fileDataWithFormattedDate = {
        ...fileData,
        lastModified: lastModified,
      };

      // 保存到数据库
      const savedFile = await this.fileModel.create(fileDataWithFormattedDate);
      return {
        success: true,
        data: savedFile,
        message: "文件信息保存成功",
      };
    } catch (error) {
      console.error("保存文件信息失败:", error);
      return {
        success: false,
        error: error.message,
        message: "文件信息保存失败",
      };
    }
  }

  async getFileById(id) {
    try {
      const file = await this.fileModel.findById(id);
      if (!file) {
        return {
          success: false,
          message: "文件不存在",
        };
      }
      return {
        success: true,
        data: file,
      };
    } catch (error) {
      console.error("获取文件信息失败:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAllFiles(limit = 100, offset = 0) {
    try {
      const files = await this.fileModel.findAll(limit, offset);
      return {
        success: true,
        data: files,
        total: files.length,
      };
    } catch (error) {
      console.error("获取文件列表失败:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = FileService;
