export interface IDownloadApp {
  url: string;
  appId: string;
  version: string;
}

export interface IDownloadPlugin {
  url: string;
  appId: string;
  version: string;
}

export interface ICheckMiniAppExistence {
  url: string;
  appId: string;
  version: string;
}
export interface IInjectPlugin {
  appId: string;
  plugins: {
    [key: string]: string
  }
}