!ifndef _DAEMON_INSTALL_NSH_
!define _DAEMON_INSTALL_NSH_

!macro REGISTER_BEAVER install_path version
    WriteRegStr ${PRODUCT_ROOT_KEY} "${DAEMON_DIR_REGKEY}" "install path" "${install_path}"
    WriteRegStr ${PRODUCT_ROOT_KEY} "${DAEMON_DIR_REGKEY}" "exe path" "${install_path}\\electron\\beaver.exe"
    WriteRegStr ${PRODUCT_ROOT_KEY} "${DAEMON_DIR_REGKEY}" "version" "${version}"

    ${WordFind} "${install_path}" "\\AppData" +1 $R0
    WriteRegStr ${PRODUCT_ROOT_KEY} "${DAEMON_DIR_REGKEY}" "temp path" "$R0\\AppData\\Local\\HLW\\"
!macroend


!macro UNINSTALL_BEAVER install_path
    RMDir /r ${install_path}
    DeleteRegKey ${PRODUCT_ROOT_KEY} "${DAEMON_DIR_REGKEY}"
!macroend

!macro INSTALL_BEAVER install_path resource_path version
    SetOutPath "${install_path}\electron"
    File /r "${resource_path}\\*.*"
!macroend

!endif
