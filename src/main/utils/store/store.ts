import fs from 'fs';
import { getRootPath } from 'mainModule/config';
import path from 'path';
import logger from "mainModule/utils/log";

const configFilePath = path.join(getRootPath(), 'config.json');

// Helper function to read the JSON file
const readConfigFile = () => {
  if (fs.existsSync(configFilePath)) {
    const fileContent = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } else {
    return {};
  }
};

// Helper function to write to the JSON file
const writeConfigFile = (data: any) => {
  logger.info(`Writing to config file: ${configFilePath}`);
  fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const saveStore = (key: string, value: any) => {
  const configData = readConfigFile();
  configData[key] = value;
  writeConfigFile(configData);
  console.log(`Data saved to ${configFilePath}`);
};

export const removeStore = (key: string) => {
  const configData = readConfigFile();
  delete configData[key];
  writeConfigFile(configData);
}

export const getStore = (key: string) => {
  const configData = readConfigFile();
  return configData[key] || null;
};


