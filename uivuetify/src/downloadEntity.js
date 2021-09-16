var _ = require('lodash');

const downloadEntity = {
    createNew:function(){
        var entity = {
            isError:false, 
            checked:false,
            url:'',
            action:'',
            urls:[],
            allm3u8:[],
            isM3u8FileName:false,
            isM3u8File:false,
            message:'',
            blob:null,
            title:'',
            downloadUrls:[],
        };
        return entity;
    },
    downloadM3u8:function(dlEntity){
        //var selFirstItem = _.find(this.completeUrls,p=>p.checked);
        var result = window.ipcRenderer.sendSync("handleDownloadM3u8Url",dlEntity);
        if(result.isError){
            alert(result.message);
        }
    },
    AnalysM3u8:function(dlEntity){
        var arg = dlEntity;
        var txt = arg.txt;
        var allm3u8 = [];       
        var urls = [];

        var lastxg = arg.url.lastIndexOf("/");
        var preurl = arg.url.substr(0, lastxg + 1);
        
        var lastpoint = preurl.lastIndexOf(".");
        var fixxian = arg.url.indexOf("/",lastpoint);
        preurl = arg.url.substr(0, fixxian + 1);
        console.log(preurl);

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

        // _.each(dlEntity.urls,p=>{
        //     dlEntity.downloadUrls.push({
        //         purl:dlEntity.url,
        //         url:p,
        //         isError:false,
        //         status:0,//0 未请求 1 请求中 2 成功 3 失败
        //         message:''
        //     });
        // });
        // console.log(arg);
    },
    downloadTs:function(data,winId){
        var urls = data.urls;
        //单个下载
        var durl = _.find(urls,p=>p.status==0);
        if(durl != undefined){
            durl.status = 1;
            durl.folder_name = data.folder_name;
            durl.winId = winId;
            console.log("downloadTs:"+ JSON.stringify(durl));
            window.ipcRenderer.sendSync('handleDownloadSelTsUrl', durl);
        }
    },
    downloadTss:function(data,winId){
        var urls = data.urls;
        //console.log(dlEntity);
        //单个下载
        for(let tick = 0;tick < 10;tick++){
            var durl = _.find(urls,p=>p.status==0);
            if(durl != undefined){
                durl.status = 1;
                durl.folder_name = data.folder_name;
                durl.winId = winId;
                console.log("downloadTss:"+ JSON.stringify(durl));
                window.ipcRenderer.sendSync('handleDownloadSelTsUrl', durl);
            }
        }
    },
    downloadErrorTss:function(dlEntity){
        var allError = _.filter(dlEntity.downloadUrls,p=> p.status == 3);
        if(allError.length != 0){
            _.each(allError,p=>{
                p.status = 0;
            });
            this.downloadTss(dlEntity);
        }
        
    }
};
module.exports = downloadEntity;