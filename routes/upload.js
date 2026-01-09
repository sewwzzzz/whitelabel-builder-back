const express = require("express");
const router = express.Router();

// 创建文件存储目录
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 初始化 tus 服务器
const { Server } = require('@tus/server');
const CustomTusStore = require("../services/tusCustomStore");
const uploadService = require("../services/uploadService");

// 创建服务实例
const tusServer = new Server({
  path: "/uploads",
  datastore: new CustomTusStore({ directory: uploadDir }),
  namingFunction(req, metadata) {
    // 使用 md5 + 文件名后缀作为文件唯一标识符
    const crypto = require("crypto");
    const fileId = crypto.randomBytes(16).toString("hex");
    const extension = metadata.filename ? metadata.filename.split(".").pop() : "";
    return extension ? `${fileId}.${extension}` : fileId;
  },
  onUploadCreate: async (req, res, upload) => {
    // 在上传创建时执行
    console.log("Upload created:", upload.id);
    // 返回res对象以保持与@tus/server的兼容性
    return res;
  },
  onUploadFinish: async (req, res, upload) => {
    // 在上传完成时执行
    console.log("Upload finished:", upload.id);
    
    try {
      // 处理上传完成的文件，提取关键信息
      const fileRecord = await uploadService.processUpload(upload);
      
      console.log("File record processed:", fileRecord);
      
      // 构造要添加的响应头
      const headers = {
        "File-ID": fileRecord.id,
        "File-Is-Image": fileRecord.is_image ? "true" : "false",
        "Access-Control-Expose-Headers": "File-ID, File-Is-Image, File-Width, File-Height, File-Color-Space"
      };
      
      // 添加图片相关信息到响应头
      if (fileRecord.is_image) {
        if (fileRecord.width) headers["File-Width"] = fileRecord.width.toString();
        if (fileRecord.height) headers["File-Height"] = fileRecord.height.toString();
        if (fileRecord.color_space) headers["File-Color-Space"] = fileRecord.color_space;
      }
      
      console.log("Response headers to be set:", headers);
      
      // 返回res对象和headers以保持与@tus/server的兼容性
      return { res, headers };
    } catch (error) {
      console.error("处理上传完成事件时出错:", error);
      // 返回res对象以保持与@tus/server的兼容性
      return { res };
    }
  },
});

// 处理所有Tus相关请求
router.all("/uploads", (req, res) => {
  // 让Tus服务器处理请求
  tusServer.handle(req, res);
});

// 处理带ID的上传请求
router.all("/uploads/*", (req, res) => {
  // 让Tus服务器处理请求
  tusServer.handle(req, res);
});

module.exports = router;