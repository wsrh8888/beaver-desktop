import fs from "fs";
import path from "node:path";
import ini from "ini";
import logger from 'mainModule/utils/log';
import { fileURLToPath } from "url";
import { getStore } from "mainModule/utils/store/store";
import { machineIdSync } from "node-machine-id";

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getRootPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '../')
  }
  return path.resolve(__dirname, '../../../')
}


export function initCustom() {
  // 使用 node-machine-id 获取真正的机器唯一标识
  // 这会返回一个 SHA-256 哈希值，确保每台机器的唯一性
  const deviceId = machineIdSync();
  process.custom = {
    ENV: "prod",
    TOOLS: false,
    TOKEN: getStore("loginInfo")?.token,
    DEVICE_ID: deviceId
  };
}

export function loadConfigs() {
  const configPaths = [
    path.resolve(__dirname, '../config.ini'),
    path.resolve(__dirname, '../../../config.ini')
  ];
  configPaths.forEach(loadConfigFile);
}

function loadConfigFile(configPath: string) {
  if (fs.existsSync(configPath)) {
    try {
      const config = ini.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.env) {
        process.custom.ENV = config.env;
      }
      if (config.tools) {
        process.custom.TOOLS = config.tools;
      }
    } catch (error) {
      logger.error("Error reading or parsing config file:");
    }
  }
}

export function setupMiniAppDirectory() {
  const rootPath = path.resolve(getRootPath(), 'mini-app');
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath);
  }
}

