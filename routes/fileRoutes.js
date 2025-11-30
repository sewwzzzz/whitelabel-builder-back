const express = require("express");
const FileModel = require("../models/FileModel");
const FileService = require("../services/FileService");
const FileController = require("../controllers/FileController");
const db = require("../config/database");

const router = express.Router();

// 初始化服务和控制器
const fileModel = new FileModel(db);
const fileService = new FileService(fileModel);
const fileController = new FileController(fileService);

// 初始化数据库表
fileModel.createTable();

// 路由定义
router.post("/files", (req, res) => fileController.saveFileInfo(req, res));
router.get("/files/:id", (req, res) => fileController.getFileInfo(req, res));
router.get("/files", (req, res) => fileController.getFileList(req, res));

module.exports = router;
