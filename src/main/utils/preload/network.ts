import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import logger from "mainModule/utils/log";

interface RequestOptions {
  url: string;
  data?: object | string | ArrayBuffer;
  header?: { [key: string]: any };
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "CONNECT"
    | "HEAD"
    | "OPTIONS"
    | "TRACE";
  timeout?: number;
  dataType?: string;
  responseType?: "text" | "arraybuffer";
  sslVerify?: boolean;
  withCredentials?: boolean;
  firstIpv4?: boolean;
  enableHttp2?: boolean;
  enableQuic?: boolean;
  enableCache?: boolean;
  enableHttpDNS?: boolean;
  httpDNSServiceId?: string;
  enableChunked?: boolean;
  forceCellularNetwork?: boolean;
  enableCookie?: boolean;
  cloudCache?: object | boolean;
  defer?: boolean;
}

interface RequestSuccess<T> {
  data: T;
  statusCode: number;
  header: { [key: string]: any };
  cookies: string[];
}

interface RequestFail {
  errCode: number;
  errSubject: string;
  data: any;
  cause: any;
  errMsg: string;
}

interface RequestTask {
  abort(): void; // 中断网络请求
}

function request<T>(
 options: RequestOptions
): Promise<RequestSuccess<T>> & RequestTask {
 const source = axios.CancelToken.source();

 const config: AxiosRequestConfig = {
   url: options.url,
   method: options.method || "GET",
   headers: options.header,
   timeout: options.timeout || 60000,
   responseType: options.responseType || "json",
   withCredentials: options.withCredentials || false,
   cancelToken: source.token,
 };

 if (options.data) {
   config.data = options.data;

   // 根据 content-type 自动转换数据格式
   if (
     config.method === "POST" &&
     typeof config.headers?.["content-type"] === "string"
   ) {
     if (config.headers["content-type"].includes("application/json")) {
       config.data = JSON.stringify(options.data);
     } else if (
       config.headers["content-type"].includes(
         "application/x-www-form-urlencoded"
       )
     ) {
       const params = new URLSearchParams();
       for (const key in options.data as object) {
         params.append(key, (options.data as any)[key]);
       }
       config.data = params.toString();
     }
   }
 }

 const promise = new Promise<RequestSuccess<T>>((resolve, reject) => {
   axios(config)
     .then((response: AxiosResponse) => {
       const resData = response.data;

       const successData: RequestSuccess<any> = {
         data: resData,
         statusCode: response.status,
         header: response.headers,
         cookies: response.headers["set-cookie"] || [],
       };

       resolve(successData);
     })
     .catch((error) => {
       logger.error("Request error", error);

       if (axios.isCancel(error)) return;

       // 创建自定义错误对象
       const customError = {
         errCode:
           error.code ||
           -1,
         errSubject:
           error.response?.statusText ||
           error.message ||
           'Unknown Error',
         data:
           error.response?.data ||
           null,
         cause:
           error.cause ||
           null,
         errMsg:
           error.message ||
           'An unknown error occurred',
         requestInfo:
           { 
             url:
               config.url,
             method:
               config.method,
             headers:
               config.headers,
             data:
               config.data
          },
       };

       reject(customError);
     });
 }) as Promise<RequestSuccess<T>> & RequestTask;

 promise.abort = () => {
   source.cancel("Request aborted.");
 };

 return promise;
}

export default request;

