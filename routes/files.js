const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// 获取文件信息
router.get("/files/:id", fileController.getFile);

// 获取文件列表
router.get("/files", fileController.getFiles);

// 删除文件
router.delete("/files/:id", fileController.deleteFile);

module.exports = router;