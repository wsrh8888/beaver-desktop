import fs from "fs";
import path from "node:path";
import ini from "ini";
import logger from 'mainModule/utils/log';
import { fileURLToPath } from "url";
import { getStore } from "mainModule/utils/store/store";

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getRootPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '../')
  }
  return path.resolve(__dirname, '../../../')
}


export function initCustom() {
  console.error('11111111111', getStore("loginInfo"))
  process.custom = {
    ENV: "prod",
    TOOLS: false,
    TOKEN: getStore("loginInfo")?.token,
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


