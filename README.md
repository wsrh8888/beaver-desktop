
# 常用命令
  1、解压 asar 
    npm install -g @electron/asar
     asar extract ./app.asar ./app

 /DVERSION=1.0.0 /DRESOURCEDIR="D:\mine\beaver-im\beaver-im-client\release\win-unpacked" /DOUTPUTDIR="D:\mine\beaver-im\beaver-im-client\output" "D:\mine\beaver-im\beaver-im-client\build\installer.nsi"

  "C:\Program Files (x86)\nsis\makensis.exe"  "D:\mine\beaver-im\beaver-im-client\build\installer.nsi"


webview监听主进程消息
  window.miniApp.onMainMessage(message => {
    console.log('Received message from Main Process:', message);
  });

主进程监听render进程消息
window.miniApp.onRendererMessage(message => {
  console.log('Received message from Main Renderer:', message);
});