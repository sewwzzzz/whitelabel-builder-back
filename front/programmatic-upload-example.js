// 使用 Uppy 以编程方式添加文件并自动上传的示例
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

// 初始化 Uppy 实例，开启自动上传
const uppy = new Uppy({
  debug: true,
  autoProceed: true, // 自动开始上传
});

// 使用 Tus 插件配置上传端点
uppy.use(Tus, {
  endpoint: 'http://localhost:3000/uploads',
  retryDelays: [0, 1000, 3000, 5000],
  chunkSize: 5 * 1024 * 1024,
  removeFingerprintOnSuccess: true
  // 注意：resume 选项已在 tus-js-client v2 中移除，使用 URL storage API 替代
});

// 监听文件添加事件
uppy.on('file-added', (file) => {
  console.log('文件已添加:', file.name);
});

// 监听上传开始事件
uppy.on('upload-start', (data) => {
  console.log('上传开始，文件列表:', data.fileIDs);
});

// 监听上传进度事件
uppy.on('upload-progress', (file, progress) => {
  console.log(`文件 "${file.name}" 上传进度:`, progress);
  const percent = Math.round(progress.percentage);
  console.log(`进度: ${percent}% (${progress.bytesUploaded}/${progress.bytesTotal} bytes)`);
});

// 监听上传成功事件
uppy.on('upload-success', (file, response) => {
  console.log(`文件 "${file.name}" 上传成功!`);
  console.log('响应:', response);
});

// 监听上传错误事件
uppy.on('upload-error', (file, error, response) => {
  console.error(`文件 "${file.name}" 上传失败:`, error);
  console.error('错误响应:', response);
});

// 监听所有上传完成事件
uppy.on('complete', (result) => {
  console.log('所有文件上传完成:');
  console.log('成功:', result.successful);
  console.log('失败:', result.failed);
});

/**
 * 方法1: 通过 File API 添加文件
 */
function addFileFromFileInput(file) {
  try {
    // 添加单个文件
    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
    });
    // 由于设置了 autoProceed: true，文件会自动开始上传
  } catch (error) {
    console.error('添加文件时出错:', error);
  }
}

/**
 * 方法2: 通过 Blob 创建文件并添加
 */
function addFileFromBlob(blob, filename) {
  try {
    // 创建文件对象
    const file = new File([blob], filename, { type: blob.type });
    
    // 添加文件到 Uppy
    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
    });
    // 由于设置了 autoProceed: true，文件会自动开始上传
  } catch (error) {
    console.error('添加文件时出错:', error);
  }
}

/**
 * 方法3: 通过 URL 获取文件并添加
 */
async function addFileFromUrl(url, filename) {
  try {
    // 获取文件内容
    const response = await fetch(url);
    const blob = await response.blob();
    
    // 添加文件到 Uppy
    uppy.addFile({
      name: filename || url.split('/').pop(),
      type: blob.type,
      data: blob,
    });
    // 由于设置了 autoProceed: true，文件会自动开始上传
  } catch (error) {
    console.error('从URL添加文件时出错:', error);
  }
}

/**
 * 方法4: 手动触发上传（如果 autoProceed 设为 false）
 */
function startUploadManually() {
  uppy.upload().then((result) => {
    console.log('上传完成:', result);
  }).catch((error) => {
    console.error('上传过程中出错:', error);
  });
}

/**
 * 移除文件
 */
function removeFile(fileID) {
  uppy.removeFile(fileID);
  console.log(`文件 ${fileID} 已移除`);
}

/**
 * 清空所有文件
 */
function cancelAll() {
  uppy.cancelAll();
  console.log('所有文件已清空');
}

// 示例用法:
// 1. 假设有一个文件输入元素
// <input type="file" id="file-input" />

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  
  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        // 添加选中的文件
        Array.from(files).forEach(file => {
          try {
            uppy.addFile({
              name: file.name,
              type: file.type,
              data: file,
            });
            // 由于设置了 autoProceed: true，文件会自动开始上传
          } catch (error) {
            console.error('添加文件时出错:', error);
          }
        });
      }
    });
  }
});

// 导出函数供外部使用
export {
  uppy,
  addFileFromFileInput,
  addFileFromBlob,
  addFileFromUrl,
  startUploadManually,
  removeFile,
  cancelAll
};

export default uppy;