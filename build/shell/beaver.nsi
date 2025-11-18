; 定义安装程序的常量
!define PRODUCT_NAME "海狸IM"
!define PRODUCT_VERSION ${VERSION}
!define RESOURCE_DIR ${RESOURCEDIR}
!define OUTPUT_DIR ${OUTPUTDIR}
!define PRODUCT_WEB_SITE "http://www.mycompany.com"
!define PRODUCT_PROCESS_NAME "beaver"
!define PRODUCT_PUBLISHER "My company, Inc."

!define PRODUCT_ROOT_KEY "HKLM"
!define PRODUCT_USER_KEY "HKCU"
!define PRODUCT_CLIENT_TYPE 0

!define DAEMON_DIR_REGKEY "Software\HLW\beaver"

!define AUTORUN_REGKEY "Software\Microsoft\Windows\CurrentVersion\Run"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define IS_WRITE_UNINSTALL 1

SetCompressor lzma
!addincludedir .\include

; 包含必要的NSIS库和模块
!include "MUI2.nsh" ; 使用现代用户界面2 (MUI2) 模块
!include "FileFunc.nsh" ; 文件操作模块
!include "LogicLib.nsh" ; 逻辑操作模块
!include "WordFunc.nsh" ; 
!include "beaver.nsh" ;

; 定义MUI界面设置
!define MUI_ABORTWARNING
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; 安装过程页面定义
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY ; 添加目录选择页面
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; 卸载过程页面定义
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; 定义语言设置
!insertmacro MUI_LANGUAGE "SimpChinese"

; 保留InstallOptions插件
ReserveFile /plugin "InstallOptions.dll"

; 定义安装程序的基本信息
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${OUTPUT_DIR}"
InstallDir "$APPDATA\beaver" ; 设置默认安装路径
ShowInstDetails show
ShowUnInstDetails show

; 定义版本信息
VIProductVersion ${PRODUCT_VERSION}
VIAddVersionKey FileDescription "${PRODUCT_PROCESS_NAME}"
VIAddVersionKey FileVersion "${PRODUCT_VERSION}"
VIAddVersionKey ProductName "${PRODUCT_NAME}"
VIAddVersionKey OriginalFilename "${PRODUCT_PROCESS_NAME}"

; 请求管理员权限
RequestExecutionLevel admin

; 主安装部分
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite on
  !insertmacro INSTALL_BEAVER $INSTDIR ${RESOURCE_DIR} ${PRODUCT_VERSION}

  ; 创建卸载程序
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; 创建桌面快捷方式
  CreateShortcut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\海狸.exe" "$INSTDIR\app.ico"
  
  ; 注册卸载信息到注册表
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME} ${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
SectionEnd

; 注册部分
Section -Post
    SetRegView 64
    System::Alloc 16
    System::Call kernel32::GetLocalTime(isR0)
    System::Call *$R0(&i2.R1,&i2.R2,&i2.R3,&i2.R4,&i2.R5,&i2.R6,&i2.R7,&i2.R8)
    System::Free $R0
    !insertmacro REGISTER_BEAVER $INSTDIR ${PRODUCT_VERSION}
SectionEnd

/******************************
 *  以下是安装程序的卸载部分  *
 ******************************/

Section Uninstall 
    SetRegView 64
    !insertmacro UNINSTALL_BEAVER $INSTDIR
    ; 删除注册表中与卸载程序相关的键
    DeleteRegKey ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
    
    ; 删除桌面快捷方式
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    SetAutoClose true
SectionEnd

; 初始化函数（卸载过程）
Function un.onInit
FunctionEnd

; 安装成功后的函数
Function .onInstSuccess
FunctionEnd

; 卸载成功后的函数
Function un.onUninstSuccess
FunctionEnd

; 初始化函数
Function .onInit
FunctionEnd
