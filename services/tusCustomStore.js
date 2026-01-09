const { FileStore } = require("@tus/file-store");

class CustomTusStore extends FileStore {
  constructor(options) {
    super(options);
  }
  
  /**
   * 重写写入完成方法
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {string} file_id - 文件ID
   * @returns {Promise<Object>} 返回res对象以保持与@tus/server的兼容性
   */
  async writeRespHeaders(req, res, file_id) {
    // 调用父类方法
    await super.writeRespHeaders(req, res, file_id);
    
    // 必须返回res对象以保持与@tus/server的兼容性
    return res;
  }
}

module.exports = CustomTusStore;