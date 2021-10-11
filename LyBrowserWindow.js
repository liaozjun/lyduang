const {BrowserWindow } = require('electron')
const path = require('path')
var _ = require('lodash');
const fs = require('fs');
const { session,net } = require('electron')

var lyBrowserWindow = {
    createNew: function(){
        var win = {};
        win.id=0;
        win._browserWindow=null;
        win.mainGetM3u8 = false;
        win.mainGetUrl = [];
        win.handleReset = function(){
            this.mainGetUrl = [];
            this.mainGetM3u8 = false;
            return 'OK';
        };
        win.init = function(removeDownloadWindows){
            var self = this;
            self._browserWindow = new BrowserWindow({
                width: 1024,
                height: 768,
                show:false,
                webPreferences: {
                    nodeIntegration:true,
                    webviewTag:true,
                    preload: path.join(__dirname, 'preload.js')
                }
            });
            self._browserWindow.title = `下载页-${self._browserWindow.id}`;
            self.id = self._browserWindow.id;
            //self._browserWindow.loadURL(`http://localhost:8080/#/DownloadPage/${self._browserWindow.id}`);
            self._browserWindow.loadURL(`http://localhost:9001/#/DownloadPage/${self._browserWindow.id}`);
            self._browserWindow.once('close', (event,args) => {
              //console.log("once:"+self._browserWindow.id)
              removeDownloadWindows(self._browserWindow.id);                
            });
    
            self._browserWindow.once('ready-to-show', () => {
                self._browserWindow.show()
                self._browserWindow.openDevTools();
            });
            self._browserWindow.webContents.session.webRequest.onCompleted((details) => {    
                if(details.url != undefined && details.url != null &&
                    details.url.indexOf('devtools://') == -1 
                    //details.url.indexOf('localhost') == -1 
                    ){
                    //homeWindow.webContents.send('WebRequestOnCompleted',details.url);
                    //console.log('WebRequestOnCompleted'+ details.url); 下载流程 rendererservice要new
                    self.DownloadM3u8Url(details.url,self._browserWindow);
                }
            });
            self._browserWindow.webContents.session.webRequest.onErrorOccurred((details) => {
                if(details.url != undefined && details.url != null && details.url.indexOf('devtools://') == -1){
                    //homeWindow.webContents.send('WebRequestOnErrorOccurred',details.url);
                }
            });
            
        };
        win._handleDownloadSelTsUrl = function(event,arg,dw){
            try{
                //console.log('_handleDownloadSelTsUrl'+JSON.stringify(arg));
               // var result = {isError:false,status:3,purl:arg.purl,url:arg.url,blob:null,fileName:'',message:''};
                arg.isError = false;
                arg.status = 3;
                arg.message = '';
                arg.blob = null;
                var result = arg;
                var lastof = result.url.lastIndexOf("/");
                var splitwhy = result.url.split("?");          
                var fileName = result.url.substr(lastof + 1, splitwhy[0].length - lastof - 1);
                result.fileName = fileName;
               
                const request = net.request({
                  method: 'GET',
                  url: result.url,
                  session: dw.webContents.session,// session.defaultSession,
                  useSessionCookies: true
                });
                //console.log(各步骤的) 看看有没有超时设置
                request.on('error',err=>{
                  //console.log(err);
                  result.isError = true;
                  result.status = 3;
                  result.message = err;
                  if(!dw.isDestroyed()){
                    dw.webContents.send('onDownloadSelTsUrlCompleted',result);
                  }
                });
                request.on('response', (response) => {
                  response.on('aborted', ()=>{
                    result.isError = true;
                    result.message = "aborted"
                    if(!dw.isDestroyed()){
                      dw.webContents.send('onDownloadSelTsUrlCompleted',result);
                    }
                  });
          
                  response.on('error',(err)=>{
                    result.isError = true;
                    result.message = err;
                    if(!dw.isDestroyed()){
                      dw.webContents.send('onDownloadSelTsUrlCompleted',result);
                    }
                  });
          
                  response.on('end', () => {          
                    fs.appendFileSync(`./m3u8/${result.folder_name}/${fileName}`, result.blob, (err) => {
                      if (err) {
                        throw err;
                      }
                    });
                    result.blob = null;          
                    result.isError = false;
                    result.status = 2;
                    //console.log("response end:" + result.url);
                    if(!dw.isDestroyed()){
                      dw.webContents.send('onDownloadSelTsUrlCompleted',result);
                    }
                  });
              
                  response.on('data', (chunk) => {
                    if(result.blob == null){            
                      result.blob = Buffer.concat([chunk]);
                    }else{
                      result.blob = Buffer.concat([result.blob,chunk]);
                    }
                  });
              
                });
                
                request.end();
                
                result.isError = false;
                event.returnValue = result;
            }catch(err){
                //console.log("request err:"+ JSON.stringify(err));
                console.log(err);
                result.isError = true;
                result.status = 3;
                result.message = JSON.stringify(err);
                event.returnValue = result;
                if(!dw.isDestroyed()){
                  dw.webContents.send('onDownloadSelTsUrlCompleted',result);      
                }
            }
            return event;  
        };
        win.DownloadM3u8Url = function(url,downloadWindow){
          var self =this;
            var pointjs = url.indexOf(".js");
            if(pointjs != -1){
              //console.log('pointjs:'+ self.mainGetM3u8);
              return ;
            }
        
            if(this.mainGetM3u8){
             //console.log('mainGetM3u8:'+ self.mainGetM3u8);
              return ;
            }
            var findUrl = _.find(self.mainGetUrl,u=>u==url)
            if(findUrl != undefined){
              //console.log('DownloadM3u8Url Exist:'+url)
              return;
            }
            self.mainGetUrl.push(url);
            try{
              
                var arg ={
                    blob : null,
                    url:url,
                    isError :true,
                    message :'',
                    isM3u8File:false,
                    txt:null,
                    winId:downloadWindow.id
                };
              
                //console.log('DownloadM3u8Url:'+JSON.stringify(arg));
                const request = net.request({
                    method: 'GET',
                    url: arg.url,
                    session: downloadWindow.webContents.session,// session.defaultSession,
                    useSessionCookies: true
                });
                //console.log('request 1:'+JSON.stringify(arg));
                request.on('error',error=>{
                    arg.isError = true;
                    arg.message = error;
                    if(!downloadWindow.isDestroyed()){
                      downloadWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
                    }
                });
                request.on('response', (response) => {
                    response.on('aborted', ()=>{
                      arg.isError = true;
                      arg.message = 'response.aborted';
                      //console.log(JSON.stringify(arg));
                      if(!downloadWindow.isDestroyed()){
                        downloadWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
                      }
                    });
                    response.on('error',()=>{
                      arg.isError = true;
                      arg.message = 'response.error';
                      //console.log('response error'+JSON.stringify(arg));
                      if(!downloadWindow.isDestroyed()){
                        downloadWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
                      }
                    });
                    response.on('end', () => {
                      var txt = _.toString(arg.blob);
                      arg.txt = txt;
                      arg.blob = null;
                      var first_extinf = txt.indexOf("#EXTINF");
                      var last_ENDLIST  = txt.lastIndexOf("#EXT-X-ENDLIST");
                      var last_extinf = txt.lastIndexOf("#EXTINF");
                      //console.log(first_extinf);
                      //console.log(last_ENDLIST);
                      if(first_extinf == -1 || last_ENDLIST == -1 || first_extinf == last_extinf){
                          //不是m3u8文件
                          arg.isM3u8File = false;
                          arg.txt = null;
                          //console.log(JSON.stringify(arg));
                      }else{
                          arg.isM3u8File = true;
                          self.mainGetM3u8 = true;
                          arg.isError = false;
                          self.AnalysM3u8(arg);
                          console.log(`${arg.isM3u8File},${arg.isError},mainGetM3u8:${self.mainGetM3u8}`);
                          //console.log(arg);
                          if(!downloadWindow.isDestroyed()){
                            downloadWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
                          }
                      }
                    
                    });
                
                    response.on('data', (chunk) => {
                      if(arg.blob == null){            
                          arg.blob = Buffer.concat([chunk]);
                      }else{
                          arg.blob = Buffer.concat([arg.blob,chunk]);
                      }
                    });
                
                });
                request.end();
                arg.isError = false;
            }catch(err){
              arg.isError = true;
              arg.message = JSON.stringify(err);
              if(!downloadWindow.isDestroyed()){
                downloadWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
              }
              console.log(err);
              //console.log('catch err'+JSON.stringify(arg));
            }
        };
        win.AnalysM3u8 = function(arg){    
            var txt = arg.txt;
            var allm3u8 = [];       
            var urls = [];
        
            var lastxg = arg.url.lastIndexOf("/");
            var preurl = arg.url.substr(0, lastxg + 1);
            
            // var lastpoint = preurl.lastIndexOf(".");
            // var fixxian = arg.url.indexOf("/",lastpoint);
            // preurl = arg.url.substr(0, fixxian + 1);
            
        
            var first_extinf = txt.indexOf("#EXTINF");
            var last_extinf = txt.lastIndexOf("#EXT-X-ENDLIST");
            var m3u8substr = txt.substr(first_extinf, last_extinf - first_extinf);
            var beginstr = txt.substr(0, first_extinf);
            var endstr = txt.substring(last_extinf);
            var splits = m3u8substr.split('\n');
            
            allm3u8.push(beginstr);
            _.each(splits,(str)=>{
                //console.log(str);
                var exPos = str.indexOf("#EXTINF");
                if (exPos == -1) {
                    //str = str+"1";
                    if (str.indexOf("http") == -1) {
                        if(str != null && str.length!=0){
                            urls.push(preurl + str);
                        }
                    }
                    else {
                        urls.push(str);
                    }
                    var lastof = str.lastIndexOf("/");
                    var splitwhy = str.split("?");          
                    var filename = str.substr(lastof + 1, splitwhy[0].length - lastof - 1);
                    if(filename != null && filename.length != 0){
                        allm3u8.push(filename);
                    }
                }
                else {
                    allm3u8.push(str);
                }
            });
            allm3u8.push(endstr);
        
            arg.urls=urls;
            arg.allm3u8 = allm3u8;
            arg.txt = '';
        };
        // win._handleDownloadM3u8Url = function (event,arg){
        //     try{
        //         //console.log('handleDownloadM3u8Url:'+JSON.stringify(arg));
        //         arg.blob = null;          
        //         const request = net.request({
        //             method: 'GET',
        //             url: arg.url,
        //             session: session.defaultSession,
        //             useSessionCookies: true
        //           });
        //         request.on('error',error=>{
        //           arg.isError = true;
        //           arg.message = error;
        //           mainService._homeWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
        //         });
        //         request.on('response', (response) => {
        //           response.on('aborted', ()=>{
        //             arg.isError = true;
        //             arg.message = 'response.aborted';
        //             mainService._homeWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
        //           });
        //           response.on('error',()=>{
        //             arg.isError = true;
        //             arg.message = 'response.error';
        //             mainService._homeWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
        //           });
        //           response.on('end', () => {
        //             var txt = _.toString(arg.blob);
        //             arg.txt = txt;
        //             arg.blob = null;
        //             var first_extinf = txt.indexOf("#EXTINF");
        //             var last_ENDLIST  = txt.lastIndexOf("#EXT-X-ENDLIST");
        //             var last_extinf = txt.lastIndexOf("#EXTINF");
        //             //console.log(first_extinf);
        //             //console.log(last_ENDLIST);
        //             if(first_extinf == -1 || last_ENDLIST == -1 || first_extinf == last_extinf){
        //               //不是m3u8文件
        //               arg.isM3u8File = false;
        //               arg.txt = null;
        //             }else{
        //               arg.isM3u8File = true;
        //             }
        //             arg.isError = false
        //             mainService._homeWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
        //           });
              
        //           response.on('data', (chunk) => {
        //             if(arg.blob == null){            
        //               arg.blob = Buffer.concat([chunk]);
        //             }else{
        //               arg.blob = Buffer.concat([arg.blob,chunk]);
        //             }
        //           });
              
        //         });
        //         request.end();
        //         arg.isError = false;      
        //         event.returnValue = arg;
        //     }catch(err){
        //         arg.isError = true;
        //         arg.message = JSON.stringify(err);
        //         mainService._homeWindow.webContents.send('handleDownloadM3u8UrlCompleted',arg);
        //     }
        // };
        return win;
  　}
  }
  module.exports = lyBrowserWindow;