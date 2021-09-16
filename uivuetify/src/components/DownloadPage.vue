<template>
  <v-app id="inspire">
    <v-app-bar      
      color="white"
      flat
    >
      <v-container class="py-0 fill-height">
        <v-avatar
          class="mr-10"
          color="grey darken-1"
          size="32"
        ></v-avatar>

        <!-- <v-btn
         dense
         text
          @click="showPalyDialog"
        >
        播放列表
        </v-btn> -->

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
    </v-app-bar>

    <v-main class="grey lighten-3" :style="{height:mainHeight,width:'100%'}">
      <v-container style="height:100%;width:100%;margin:0px;max-width:none;">        
        <webview id="foo" src="http://localhost:8099" style="display:inline-flex; width:100%; height:100%"></webview>       
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
    }
  },
  created:function(){
    rendererService.Init(this);
    rendererService.setThatDocumnet(document);
  },
  mounted:function(){   
    console.log('downloadpage mounted');
    console.log(this.$route.params.winId);
    this.winId = this.$route.params.winId;
  },
  methods:{
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
      window.ipcRenderer.sendSync('handleReset', 'handleReset');
      let fooWebview = document.getElementById('foo');
      fooWebview.loadURL(tmpUrl);
    }
  }
}
</script>