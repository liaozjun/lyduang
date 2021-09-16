var _ = require('lodash');
var downloadEntity = require('./downloadEntity');
var that_document=null;
// var getM3u8 = false;
const rendererService = {
    Init:function(vm){
        this._viewModel = vm;
        //window.ipcRenderer.on("WebRequestOnCompleted",this._WebRequestOnCompleted);

        window.ipcRenderer.on("WebRequestOnErrorOccurred",this._WebRequestOnErrorOccurred);

        window.ipcRenderer.on("handleDownloadM3u8UrlCompleted",this._handleDownloadM3u8UrlCompleted);

        window.ipcRenderer.on("onDownloadSelTsUrlCompleted",this._onDownloadSelTsUrlCompleted);
    },
    setThatDocumnet(thisDoc){
        that_document = thisDoc;
    },
    _handleDownloadM3u8UrlCompleted:function(event,arg){
        console.log("_handleDownloadM3u8UrlCompleted func:"+ JSON.stringify(arg));
        if(arg.isError){
            console.log("_handleDownloadM3u8UrlCompleted error:"+ JSON.stringify(arg));
            return ;
        }
        
        if(arg.isM3u8File){
             let webview = that_document.getElementById('foo');
             arg.title = webview.getTitle();
            //console.log(JSON.stringify(arg));
            rendererService._viewModel.downloadM3u8.canDownload = true;
            rendererService._viewModel.downloadM3u8.m3u8Entity = arg;
        }
    },
    _onDownloadSelTsUrlCompleted:function(event,arg){         
        console.log("_onDownloadSelTsUrlCompleted:"+ JSON.stringify(arg));
        // if(arg.isError){
        //     alert("_onDownloadSelTsUrlCompleted:\r\n"+arg.message.message+"\r\n"+arg.message.stack);
        // }
        // var ts = _.find(rendererService._viewModel.downloadUrls,p=>{
        //     return p.url == arg.url;
        // });
        // if(ts != undefined){
        //     ts.isError = arg.isError;
        //     ts.status = arg.status;        
        // }
        var tstmp = _.find(rendererService._viewModel.downloadM3u8.m3u8Entity.urls,p=>p.url == arg.url);       
        if(tstmp !=undefined){
            tstmp.status = arg.status;
            tstmp.isError = arg.isError;
        }
        downloadEntity.downloadTs(rendererService._viewModel.downloadM3u8.m3u8Entity,arg.winId);
        
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
        console.log("WebRequestOnErrorOccurred:"+JSON.stringify(arg));
    },
}
module.exports = rendererService;