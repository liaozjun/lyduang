var _ = require('lodash');
var downloadEntity = require('./downloadEntity');
var downloadPageObject = {
    createNew: function(){
        var rwin = {};
        rwin.winId= 0;
        rwin.viewModel = null;
        rwin.document = null;
        rwin._handleDownloadM3u8UrlCompleted = function(event,arg){
            var self = this;
           
            if(arg.isError){
                console.log("_handleDownloadM3u8UrlCompleted error:"+ JSON.stringify(arg));
                return ;
            }  
            //console.log("_handleDownloadM3u8UrlCompleted func:"+ JSON.stringify(arg));      
            if(arg.isM3u8File){
                let webview = self.document.getElementById('foo');
                arg.title = webview.getTitle();
                //console.log(JSON.stringify(arg));
                self.viewModel.downloadM3u8.canDownload = true;
                self.viewModel.downloadM3u8.m3u8Entity = arg;
            }

        };
        rwin._onDownloadSelTsUrlCompleted = function(event,arg){
            var self = this;
            console.log("_onDownloadSelTsUrlCompleted:"+ JSON.stringify(arg));
            var tstmp = _.find(self.viewModel.downloadM3u8.m3u8Entity.urls,p=>p.url == arg.url);       
            if(tstmp !=undefined){
                tstmp.status = arg.status;
                tstmp.isError = arg.isError;
            }
            downloadEntity.downloadTs(self.viewModel.downloadM3u8.m3u8Entity,arg.winId);
        };
        rwin._WebRequestOnErrorOccurred = function(event,arg){
            console.log("WebRequestOnErrorOccurred:"+JSON.stringify(arg));
        }
        return rwin;
    }
};
module.exports = downloadPageObject;