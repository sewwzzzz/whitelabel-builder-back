const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 导入数据库配置（这会初始化连接池）
const db = require("./config/database");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.init();
  }

  init() {
    // 中间件配置
    this.setupMiddleware();

    // 路由配置
    this.setupRoutes();

    // 错误处理
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS配置，更好地支持Tus协议
    this.app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "Upload-Length",
          "Upload-Offset",
          "Tus-Resumable",
          "Upload-Metadata",
          "Location",
          "X-HTTP-Method-Override",
          "X-Requested-With",
        ],
        exposedHeaders: [
          "Location",
          "Tus-Resumable",
          "Upload-Offset",
          "File-ID",
          "File-Is-Image",
          "File-Width",
          "File-Height",
          "File-Color-Space",
        ],
      })
    );

    // 解析JSON请求体
    this.app.use(express.json({ limit: "50mb" }));

    // 解析URL编码的请求体
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // 请求日志
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // 导入路由
    const uploadRoutes = require("./routes/upload");
    const fileRoutes = require("./routes/files");

    // 挂载路由
    this.app.use("/", uploadRoutes);
    this.app.use("/api", fileRoutes);

    // 健康检查端点
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "WhiteLabel Builder Backend",
      });
    });

    // 404处理
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "接口不存在",
      });
    });
  }

  setupErrorHandling() {
    // 全局错误处理
    this.app.use((error, req, res, next) => {
      console.error("全局错误:", error);
      
      // 如果响应头已经发送，则不能再次设置响应头
      if (res.headersSent) {
        return next(error);
      }
      
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        ...(process.env.NODE_ENV === "development" && { error: error.message }),
      });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 运行在: http://localhost:${this.port}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV}`);
      console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
    });

    // 优雅关闭
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
    process.on("SIGINT", this.gracefulShutdown.bind(this));
  }

  gracefulShutdown() {
    console.log("收到关闭信号，正在优雅关闭服务器...");
    this.server.close(() => {
      console.log("服务器已关闭");
      process.exit(0);
    });

    // 强制关闭超时
    setTimeout(() => {
      console.error("强制关闭服务器");
      process.exit(1);
    }, 10000);
  }
}

// 启动服务器
const server = new Server();
server.start();
