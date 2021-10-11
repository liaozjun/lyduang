<template>
  <v-app id="inspire">
    <v-app-bar
      dense
      flat
    >
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
const rendererService  = require('../rendererService');
export default {
  name:'downloadPage',
  data: () => ({
     downloadM3u8:{
       canDownload:false,
       m3u8Entity:null,
       winId:0,
     },
     inputUrl:'',
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
    rendererService.Init();
    console.log(this.$route.params.winId);
    this.winId = this.$route.params.winId;
    rendererService.RegisterRenderWindow(this.$route.params.winId,this,document);
  },
  mounted:function(){   
    console.log('downloadpage mounted');  
  },
  methods:{
    handleDownloadErr(){
      downloadEntity.downloadErrorTss(this.downloadM3u8.m3u8Entity,this.winId);
    },
    handleDownload(){
      //console.log(this.downloadM3u8.m3u8Entity);
      let result = window.ipcRenderer.sendSync('handleGetM3u8Entity', this.downloadM3u8.m3u8Entity);
      console.log(result);
      if(result.code == 200){
        this.downloadM3u8.m3u8Entity = result.data;
        downloadEntity.downloadTss(this.downloadM3u8.m3u8Entity,this.winId)
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