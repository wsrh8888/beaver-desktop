import fs from "fs";
import axios from "axios";
import extract from "extract-zip";

const downloadFile = async (url: string, outputPath: string): Promise<void> => {
  try {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", (err) => {
        // 如果写入流发生错误，则关闭并删除文件
        writer.close();
        fs.unlink(outputPath, () => reject(err));
      });
    });
  } catch (error) {
    // 捕获请求过程中的任何错误，并确保不会留下不完整的文件
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
};

const extractZip = async (
  zipPath: string,
  extractTo: string
): Promise<void> => {
  try {
    await extract(zipPath, { dir: extractTo });
    console.log(`Extraction complete to ${extractTo}`);
  } catch (err) {
    console.error("Error during extraction:", err);
  }
};

/**
 * @description: 检查目录是否存在以及目录下是否有package.json文件
 */
export const checkFolderExit = (path: string): boolean => {
  // 检查文件是否存在
  if (fs.existsSync(path)) {
    return true
  } else {
    return false
  }
}
export { downloadFile, extractZip };
