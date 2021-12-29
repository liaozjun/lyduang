const {app, ipcMain } = require('electron')

var _ = require('lodash');
const addon = require('./addon.node')
var lyBrowserWindow = require('./LyBrowserWindow');
const mainService = {
  _downloadWindows:[],
  Init:function(){
    //ipcMain.on("handleDownloadM3u8Url",this._handleDownloadM3u8Url);
    ipcMain.on("handleDownloadSelTsUrl",this._handleDownloadSelTsUrl);
    ipcMain.on("handleReset",this._handleReset)

    ipcMain.on("handleGetM3u8Entity",this.handleGetM3u8Entity)
    ipcMain.on("handleShowWindow",this.handleShowWindow);
    ipcMain.on("handleQueryAllM3u8",this.handleQueryAllM3u8)
    ipcMain.on("handleUpdateTitle", this.handleUpdateTitle);
    ipcMain.on("handleDeleteM3u8Sync",this.handleDeleteM3u8Sync);
  },
  
  ConfigInit:function(){
    var parms = {
      path:app.getAppPath()
    };
    var result = addon.ConfigInit(JSON.stringify(parms));
    //console.log(result);
    app.allowRendererProcessReuse = false;
  },
  addontest:function(){
    //console.log(addon.hello());

    // var parms = {
    //   id:1,
    //   folder_name:'956DB8A9A68C4f6fB1A49ADA6C1D3871',
    // };
    // addon.delete_m3u8_task(JSON.stringify(parms));
    //console.log(addon.query_all_m3u8());
  },
  handleUpdateTitle(event,arg){
    var parms = {
      id:arg.id,
      title:arg.title,
    };
    var result= addon.update_m3u8_title(JSON.stringify(parms));
    event.returnValue = JSON.parse(result);
  },
  handleDeleteM3u8Sync(event,arg){ 
    var parms = {
      id:arg.id,
      folder_name:arg.folder_name,
    };
    addon.delete_m3u8_task(JSON.stringify(parms));
    event.returnValue = {};
  },
  handleQueryAllM3u8(event,arg){
    var result = addon.query_all_m3u8();
    event.returnValue = JSON.parse(result);
  },
  removeDownloadWindows:function(winId){
    console.log("removeDownloadWindows:"+winId)
    //console.log("find:"+ JSON.stringify(mainService._downloadWindows));
    var dw = _.find(mainService._downloadWindows,win=>win.id == winId);
    
    if(dw != undefined){      
        var index = mainService._downloadWindows.indexOf(dw); 
        if (index > -1) {
          console.log('close win:'+dw.id);            
          mainService._downloadWindows.splice(index, 1); 
          console.log("removeDownloadWindows:"+ JSON.stringify(mainService._downloadWindows.length));
        } 
    }
  },
  handleShowWindow:function(event,arg){    
    //if( mainService._downloadWindows.length == 0){
      var tmp_bw = lyBrowserWindow.createNew();
      tmp_bw.init(mainService.removeDownloadWindows);
      mainService._downloadWindows.push(tmp_bw);
      //console.log("handleShowWindow1:"+ JSON.stringify(mainService._downloadWindows));
      console.log("add handleShowWindow:"+tmp_bw._browserWindow.id);
      //console.log(mainService._downloadWindows);
    //}
    event.returnValue = {};
  },
  StartHttp:function(){
    console.log(addon.StartHttp());
  },
  StopHttp:function(){
    console.log(addon.StopHttp());
  },
 
  handleGetM3u8Entity:function(event,arg){
    //console.log(arg);
    //console.log(JSON.stringify(arg));
    let res = addon.save_m3u8_task(JSON.stringify(arg));
    //console.log(res);
    event.returnValue = JSON.parse(res);
  },
  _handleReset:function(event,arg){    
    console.log('handleReset:'+JSON.stringify(arg));
    var dw = _.find(mainService._downloadWindows,win=>win.id==arg.winId);
    if(dw == undefined){
      event.returnValue = "error";
      return ;
    }
    //console.log(dw);
    event.returnValue = dw.handleReset();
  },
  _handleDownloadSelTsUrl:function(event,arg){
  
    var dw = _.find(mainService._downloadWindows,win=>win.id == arg.winId);
    if(dw == undefined){
      console.log('can not find downloadwindow');
      return ;
    } 
    //console.log('_handleDownloadSelTsUrl:');
    //console.log(dw);
    dw._handleDownloadSelTsUrl(event,arg,dw._browserWindow);    
  }  
};

module.exports = mainService;