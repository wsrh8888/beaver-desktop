import axios, { AxiosError, AxiosRequestConfig } from 'axios'


export interface IResponseSuccessData<T> {
  code: number
  msg: string
  result: T
  info: string
}

export interface headerRequest {
  [key: string]: string | number
}
// 普通接口
const request = axios.create({
  baseURL: "",
  url: '',
  data: {},
  timeout: 50000, // 请求超时时间,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  params: {}
})

request.interceptors.request.use(
  (config) => {
    let headers = Object.assign({}, {
      token: (window?.electron?.app.token ?? ""),
      deviceId: (window?.electron?.app.devicedId ?? ""),
    });
    config.headers = Object.assign({}, config.headers, headers);
    return config
  },
  (error: Error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    
    return response.data
  },
  (error: Error) => {
    return Promise.reject(error)
  }
)

function ajax<T>(config: AxiosRequestConfig): Promise<IResponseSuccessData<T>> {
  return request(config)
    .then(response => {
      let _response = response as unknown as IResponseSuccessData<T>
      return _response
    })
    .catch((err: AxiosError) => {
      return Promise.reject(err)
    }) as Promise<IResponseSuccessData<T>>
}
export { ajax }
