type config = {
  baseUrl: string
}
interface configs {
  [key: string]: config
}
const config: configs = {
  test: {
    baseUrl: 'http://127.0.0.1:8888'
  },
  prod: {
    baseUrl: 'http://127.0.0.1:8888'
   },
}

function getEnvConfig(): config {
  if ((window.electron && window.electron.env === 'test')) {
    return config.test
  }
  return config.prod
}




export const {
  baseUrl,
} = getEnvConfig()