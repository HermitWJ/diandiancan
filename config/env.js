// 全局环境配置入口（此文件入仓库，只含占位默认值）
// 真实云环境 ID 存放于同目录 env.local.js（已被 .gitignore 排除，不入库）。
// 首次使用：复制 env.local.example.js 为 env.local.js，并填入你自己的云开发环境 ID。
let config = {
  cloudEnvId: 'your-cloud-env-id'
};

try {
  // 本地私有配置（若存在则覆盖上方默认值）
  const local = require('./env.local.js');
  config = Object.assign(config, local);
} catch (e) {
  // env.local.js 不存在时使用占位配置，详见 README「环境配置」
}

module.exports = config;
