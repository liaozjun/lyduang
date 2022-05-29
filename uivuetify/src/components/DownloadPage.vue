<template>
  <v-app id="inspire">
    <v-app-bar
      dense
      flat
    >
    {{winId}}
      <v-btn
        dense
        text
        :disabled="!downloadM3u8.canDownload"
        @click="handleDownload"
      >
      下载({{m3u8TsCount}})
      </v-btn>
      <v-btn
        dense
        text
        :disabled="errorDownloadDisable"
        @click="handleDownloadErr"
      >
      失败下载
      </v-btn>
      <v-text-field
        hide-details        
        single-line
        v-model="inputUrl"
      ></v-text-field>

      <v-btn
        dense
        text
        @click="toggleMarker"
      >
      转到
      </v-btn>
    </v-app-bar>
    <!-- <v-app-bar
      color="white"
      flat
      dense
    >
      <v-container >

        <v-btn
         dense
         text
         :disabled="!downloadM3u8.canDownload"
         @click="handleDownload"
        >
        下载({{m3u8TsCount}})
        </v-btn>
        <v-text-field style="height:36px;"
          height=36
          dense 
          solo
          v-model="inputUrl"
          append-icon="mdi-map-marker"           
          @click:append="toggleMarker"           
          ></v-text-field>
      </v-container>
    </v-app-bar> -->

    <v-main class="grey lighten-3" :style="{height:mainHeight,width:'100%'}">
      <v-container style="height:100%;width:100%;margin:0px;max-width:none;">        
        <webview id="foo" src="http://www.baidu.com" style="display:inline-flex; width:100%; height:100%"></webview>       
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
var _ = require('lodash');
var downloadEntity = require('../downloadEntity');
//const rendererService  = require('../rendererService');
export default {
  name:'downloadPage',
  data: () => ({
     downloadM3u8:{
       canDownload:false,
       m3u8Entity:null,
       winId:0,
     },
     inputUrl:'',
     winId:0,
  }),
  computed:{
    mainHeight(){
      return `${document.documentElement.clientHeight-64}px`;
    },
    m3u8TsCount(){
      if(this.downloadM3u8.m3u8Entity!=null && this.downloadM3u8.m3u8Entity.urls != undefined){
        var success = _.filter(this.downloadM3u8.m3u8Entity.urls,p=>{
          return p.status == 2
        });
        var failed = _.filter(this.downloadM3u8.m3u8Entity.urls,p=>{
          return p.status == 3
        });
        return `${this.downloadM3u8.m3u8Entity.urls.length}/${success.length}/${failed.length}`;
      }
      return 0;
    },
    errorDownloadDisable(){
      if(this.downloadM3u8.m3u8Entity!=null && this.downloadM3u8.m3u8Entity.urls != undefined){
         
        var failed = _.filter(this.downloadM3u8.m3u8Entity.urls,p=>{
          return p.status == 3
        });
        var saved = _.filter(this.downloadM3u8.m3u8Entity.urls,p=>{
          return p.status == 0
        });
        if(saved.length != 0){
          return true;
        }
        return failed.length == 0?true:false;
      }
      return true;
    }
  },
  created:function(){
    //rendererService.Init();
    console.log(this.$route.params.winId);
    this.winId = this.$route.params.winId;
    
    window.ipcRenderer.on("WebRequestOnErrorOccurred", this._WebRequestOnErrorOccurred);
    window.ipcRenderer.on("handleDownloadM3u8UrlCompleted",this._handleDownloadM3u8UrlCompleted);
    window.ipcRenderer.on("onDownloadSelTsUrlCompleted",this._onDownloadSelTsUrlCompleted);
    //rendererService.RegisterRenderWindow(this.$route.params.winId,this,document);
  },
  mounted:function(){   
    console.log('downloadpage mounted');  
    let webview = document.getElementById('foo');
    webview.addEventListener('did-start-loading', ()=>{
        console.log('did-stop-loading foo getWebContentsId:',webview.getURL());
        //this.inputUrl = webview.getURL();
    });
    webview.addEventListener('did-finish-load',()=>{
      //console.log('getURL',webview.getURL());
      this.inputUrl = webview.getURL();
    });
    webview.addEventListener('new-window',(e)=>{
      console.log('new-window',e.url);
      this.inputUrl = e.url;
    });
  },
  methods:{
    _WebRequestOnErrorOccurred:function(event,arg){
      console.log(this.winId+"WebRequestOnErrorOccurred:"+JSON.stringify(arg));
    },
    _handleDownloadM3u8UrlCompleted:function(event,arg){
      var self = this;
      
      if(arg.isError){
          console.log(this.winId+"_handleDownloadM3u8UrlCompleted error:"+ JSON.stringify(arg));
          return ;
      }  
      console.log(this.winId+"_handleDownloadM3u8UrlCompleted func:"+ JSON.stringify(arg));      
      if(arg.isM3u8File){
          let webview = document.getElementById('foo');
          arg.title = webview.getTitle();
          //console.log(JSON.stringify(arg));
          self.downloadM3u8.canDownload = true;
          self.downloadM3u8.m3u8Entity = arg;
      }
    },
    _onDownloadSelTsUrlCompleted:function(event,arg){
       var self = this;
      // console.log("_onDownloadSelTsUrlCompleted:"+ JSON.stringify(arg));
       var tstmp = _.find(self.downloadM3u8.m3u8Entity.urls,p=>p.url == arg.url);       
       if(tstmp !=undefined){
           tstmp.status = arg.status;
           tstmp.isError = arg.isError;
       }
       downloadEntity.downloadTs(self.downloadM3u8.m3u8Entity,arg.winId);
    },
    handleDownloadErr(){
      downloadEntity.downloadErrorTss(this.downloadM3u8.m3u8Entity,this.winId);
    },
    handleDownload(){
      //console.log(this.downloadM3u8.m3u8Entity);
      let result = window.ipcRenderer.sendSync('handleGetM3u8Entity', this.downloadM3u8.m3u8Entity);
      //console.log(result);
      if(result.code == 200){
        this.downloadM3u8.m3u8Entity = result.data;
        downloadEntity.downloadTss(this.downloadM3u8.m3u8Entity,this.winId)
      }else{
        alert(result.message);
      }
    },
    // showPalyDialog(){
    //   window.ipcRenderer.sendSync("handleShowWindow",{});
    // },
    toggleMarker(){
      let tmpUrl = this.inputUrl;
      let httpPos = tmpUrl.indexOf('http');
      if(httpPos== -1){
        tmpUrl = "http://"+tmpUrl;
      }

      var arg = {
        winId:this.winId
      };

      window.ipcRenderer.sendSync('handleReset', arg);
      let fooWebview = document.getElementById('foo');
      fooWebview.loadURL(tmpUrl);
    }
  }
}
</script>