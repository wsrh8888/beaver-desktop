import type { IAppModule } from 'commonModule/type/preload/app'

function parseAdditionalArguments() {
  const args = process.argv.slice(1)
  let params = {
    appRootPath: '',
    env: 'prod' as 'prod' | 'test',
    token: undefined as string | undefined,
    devicedId: undefined as string | undefined,
    version: "1.0.0.0" as string,
  }
  args.forEach((arg) => {
    const paramsPrefix = '--custom='
    if (arg.startsWith(paramsPrefix)) {
      try {
        const customParams = JSON.parse(arg.substring(paramsPrefix.length))
        params = { ...params, ...customParams }
      }
      catch (e) {
        console.error('Failed to parse custom params from process arguments:', e)
      }
    }
  })
  return params
}

const appParsedArgs = parseAdditionalArguments()

// --- Application Info Module ---
export const appModule: IAppModule = {
  versions: process.versions,
  rootPath: appParsedArgs.appRootPath,
  token: appParsedArgs.token,
  env: appParsedArgs.env,
  devicedId: appParsedArgs.devicedId,
  version: appParsedArgs.version,
}
