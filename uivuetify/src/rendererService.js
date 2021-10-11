var _ = require('lodash');
//var downloadEntity = require('./downloadEntity');
var downloadPageObject = require('./downloadPageObject');
//var that_document=null;
// var getM3u8 = false;
const rendererService = {
    _downloadPageObjects:[],
    Init:function(){
        //rendererService._viewModel = vm;
        //window.ipcRenderer.on("WebRequestOnCompleted",rendererService._WebRequestOnCompleted);
        console.log('rendererService.Init');
        window.ipcRenderer.on("WebRequestOnErrorOccurred",rendererService._WebRequestOnErrorOccurred);

        window.ipcRenderer.on("handleDownloadM3u8UrlCompleted",rendererService._handleDownloadM3u8UrlCompleted);

        window.ipcRenderer.on("onDownloadSelTsUrlCompleted",rendererService._onDownloadSelTsUrlCompleted);
    },
    RegisterRenderWindow(winid,viewModel,document){
        var self = rendererService;

        var dlPageObj = downloadPageObject.createNew();
        dlPageObj.winId = winid;
        dlPageObj.viewModel = viewModel;
        dlPageObj.document = document;
        self._downloadPageObjects.push(dlPageObj);
        console.log(dlPageObj);
    },
    _handleDownloadM3u8UrlCompleted:function(event,arg){
        //console.log(`_handleDownloadM3u8UrlCompleted:${JSON.stringify(arg)}`);
        var dlPageObj = _.find(rendererService._downloadPageObjects,page=>page.winId == arg.winId);
        if(dlPageObj == undefined){
            console.log(`_handleDownloadM3u8UrlCompleted:${arg.winId} undefind`);
            return ;
        }
        dlPageObj._handleDownloadM3u8UrlCompleted(event,arg);        
    },
    _onDownloadSelTsUrlCompleted:function(event,arg){
        var dlPageObj = _.find(rendererService._downloadPageObjects,page=>page.winId == arg.winId);
        if(dlPageObj == undefined){
            console.log("");
            return ;
        }
        dlPageObj._onDownloadSelTsUrlCompleted(event,arg);
        // console.log("_onDownloadSelTsUrlCompleted:"+ JSON.stringify(arg));
        // // if(arg.isError){
        // //     alert("_onDownloadSelTsUrlCompleted:\r\n"+arg.message.message+"\r\n"+arg.message.stack);
        // // }
        // // var ts = _.find(rendererService._viewModel.downloadUrls,p=>{
        // //     return p.url == arg.url;
        // // });
        // // if(ts != undefined){
        // //     ts.isError = arg.isError;
        // //     ts.status = arg.status;        
        // // }
        // var tstmp = _.find(rendererService._viewModel.downloadM3u8.m3u8Entity.urls,p=>p.url == arg.url);       
        // if(tstmp !=undefined){
        //     tstmp.status = arg.status;
        //     tstmp.isError = arg.isError;
        // }
        // downloadEntity.downloadTs(rendererService._viewModel.downloadM3u8.m3u8Entity,arg.winId);
        
    },
    // _WebRequestOnCompleted:function(event,arg){
    //     if(getM3u8){
    //         return ;
    //     }
    //     console.log("_WebRequestOnCompleted:"+arg);
    //     var existUrl = _.find(rendererService._viewModel.completeUrls,p=>{
    //         return p.url == arg;
    //     });
    //     if(existUrl == undefined){
    //         var pos = arg.indexOf(".m3u8");
    //         var dlentity = downloadEntity.createNew();
    //         dlentity.url = arg;
    //         dlentity.isM3u8FileName = pos == -1?false:true;

    //         rendererService._viewModel.completeUrls.push(dlentity);
    //         downloadEntity.downloadM3u8(dlentity);
    //     }
    // },
    _WebRequestOnErrorOccurred:function(event,arg){
        //console.log("WebRequestOnErrorOccurred:"+JSON.stringify(arg));
        var dlPageObj = _.find(rendererService._downloadPageObjects,page=>page.winId == arg.winId);
        if(dlPageObj == undefined){
            console.log("");
            return ;
        }
        dlPageObj._WebRequestOnErrorOccurred(event,arg);
    },
}
module.exports = rendererService;