// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
var _ = require('lodash'); 



const mainService  = require('./mainService');
mainService.Init();
//var homeWindow;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show:false,
    webPreferences: {
      nodeIntegration:true,
      webviewTag:true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  // let webContents=mainWindow.webContents;
  // webContents.on('did-finish-load',()=>{
  //     //webContents.setZoomFactor(0.9);
  //     // webContents.setVisualZoomLevelLimits(0.,1);
  //     // webContents.setLayoutZoomLevelLimits(0,0);
  // });


  // mainWindow.webContents.session.webRequest.onCompleted((details) => {    
  //   if(details.url != undefined && details.url != null &&
  //      details.url.indexOf('devtools://') == -1 &&
  //      details.url.indexOf('localhost') == -1 
  //      ){
  //     //homeWindow.webContents.send('WebRequestOnCompleted',details.url);
  //     //console.log('WebRequestOnCompleted'+details.url);
  //     mainService.DownloadM3u8Url(details.url);
  //   }
  // });
  // mainWindow.webContents.session.webRequest.onErrorOccurred((details) => {
  //   if(details.url != undefined && details.url != null && details.url.indexOf('devtools://') == -1){
  //     //homeWindow.webContents.send('WebRequestOnErrorOccurred',details.url);
  //   }
  // });
  mainService.ConfigInit();
  mainService.addontest();
   
  
  // let urlHome = path.join(__dirname, 'dist','index.html');
  // mainWindow.loadFile(urlHome)
  // console.log(urlHome);
  //mainWindow.loadURL("http://localhost:8080");
  mainWindow.loadURL('http://localhost:9001/');
  mainWindow.openDevTools();//.webContents.openDevTools();
  //homeWindow = mainWindow;
  //mainService.setHomeWindow(homeWindow);
  mainWindow.maximize()
  mainWindow.show()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainService.StartHttp();
  createWindow();  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  mainService.StopHttp();
  if (process.platform !== 'darwin') app.quit()
})

//System.Diagnostics.Process.Start(包括路径的文件名)； fluent-ffmpeg



