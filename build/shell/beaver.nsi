!define PRODUCT_NAME "∫£¿ÍIM"
!define PRODUCT_VERSION ${VERSION}
!define RESOURCE_DIR ${RESOURCEDIR}
!define OUTPUT_DIR ${OUTPUTDIR}
!define PRODUCT_WEB_SITE "http://www.mycompany.com"
!define PRODUCT_PROCESS_NAME "beaver"
!define PRODUCT_PUBLISHER "My company, Inc."

!define PRODUCT_ROOT_KEY "HKLM"
!define PRODUCT_USER_KEY "HKCU"
!define PRODUCT_CLIENT_TYPE 0

!define DAEMON_DIR_REGKEY "Software\beaver"

!define AUTORUN_REGKEY "Software\Microsoft\Windows\CurrentVersion\Run"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define IS_WRITE_UNINSTALL 1

SetCompressor lzma
!addincludedir .\include

!include "MUI2.nsh" ; 
!include "FileFunc.nsh" ; 
!include "LogicLib.nsh" ; 
!include "WordFunc.nsh" ; 
!include "beaver.nsh" ;

!define MUI_ABORTWARNING
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY 
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "SimpChinese"

ReserveFile /plugin "InstallOptions.dll"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${OUTPUT_DIR}"
InstallDir "$APPDATA\beaver"
ShowInstDetails show
ShowUnInstDetails show

VIProductVersion ${PRODUCT_VERSION}
VIAddVersionKey FileDescription "${PRODUCT_PROCESS_NAME}"
VIAddVersionKey FileVersion "${PRODUCT_VERSION}"
VIAddVersionKey ProductName "${PRODUCT_NAME}"
VIAddVersionKey OriginalFilename "${PRODUCT_PROCESS_NAME}"

RequestExecutionLevel admin

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite on
  !insertmacro INSTALL_BEAVER $INSTDIR ${RESOURCE_DIR} ${PRODUCT_VERSION}

  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  CreateShortcut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\beaver.exe" "$INSTDIR\app.ico"
  
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME} ${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
SectionEnd

Section -Post
    SetRegView 64
    System::Alloc 16
    System::Call kernel32::GetLocalTime(isR0)
    System::Call *$R0(&i2.R1,&i2.R2,&i2.R3,&i2.R4,&i2.R5,&i2.R6,&i2.R7,&i2.R8)
    System::Free $R0
    !insertmacro REGISTER_BEAVER $INSTDIR ${PRODUCT_VERSION}
SectionEnd


Section Uninstall 
    SetRegView 64
    !insertmacro UNINSTALL_BEAVER $INSTDIR
    DeleteRegKey ${PRODUCT_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
    
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    SetAutoClose true
SectionEnd

Function un.onInit
FunctionEnd

Function .onInstSuccess
FunctionEnd

Function un.onUninstSuccess
FunctionEnd

Function .onInit
FunctionEnd
