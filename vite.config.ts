import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";
import path from "path";

const alias = {
  commonModule: path.resolve(__dirname, "src/common"),
  mainModule: path.resolve(__dirname, "src/main"),
  renderModule: path.resolve(__dirname, "src/render"),
};

export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      svgLoader(),
      electron([
        {
          entry: path.resolve(__dirname, "src/main/main.ts"),
          vite: {
            build: {
              outDir: "dist-electron",
              rollupOptions: {
                external: ["electron", "electron-screenshots"],
                output: {
                  globals: {
                    electron: "electron",
                  },
                },
              },
            },
            resolve: {
              alias: alias,
            },
          },
        },
        {
          entry: path.resolve(__dirname, "src/main/preload/electron.ts"),
          onstart({ reload }) {
            reload();
          },
          vite: {
            resolve: {
              alias: alias,
            },
            build: {
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: ["electron", "electron-screenshots"],
                output: {
                  inlineDynamicImports: true,
                  format: "cjs", // 确保输出 CommonJS 格式
                  globals: {
                    electron: "electron",
                  },
                },
              },
            },
          },
        },
      ]),
      electronRenderer(),
    ],
    resolve: {
      alias: alias,
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, "app.html"),
          login: path.resolve(__dirname, "login.html"),
        },
        output: {
          format: "es", // 确保输出 ES 模块格式
          globals: {
            electron: "electron",
          },
        },
        external: ["electron", "electron-screenshots"],
      },
    },
  };
});
