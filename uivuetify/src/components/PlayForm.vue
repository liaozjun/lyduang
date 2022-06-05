<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      width=688
    >
      <v-list dense flat>
        <v-list-item-group
        v-model="selectedItem"
        color="primary"
        dense
        
        >
          <template v-for="(link) in links">
            <v-divider :key="link.folder_name"></v-divider>
            <v-list-item style="min-height:none;padding-right:3px;" link :key="link.id" >
              <v-list-item-content>
                <v-list-item-title>{{ link.title }}</v-list-item-title>               
              </v-list-item-content>
              <v-list-item-action style="margin:0px;">
                <div>
                <v-btn icon small  @click="handlePlay(link)">
                  <v-icon color="grey lighten-1" >mdi-arrow-right-drop-circle-outline </v-icon>
                </v-btn>
                <v-btn icon small @click="handleShowEditDialog(link)">
                  <v-icon color="grey lighten-1">mdi-table-edit</v-icon>
                </v-btn>
                <v-btn icon small @click="handleShowDelDialog(link)">
                  <v-icon color="grey lighten-1">mdi-trash-can-outline</v-icon>
                </v-btn>
                </div>
              </v-list-item-action>
            </v-list-item>
            
          </template>
          
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar dense flat app outlined>
      <v-toolbar-title :hidden="drawer" style="margin-right:10px;">lym3u8</v-toolbar-title>
       
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon small
            @click="drawer = !drawer"
            v-bind="attrs"
            v-on="on"
           ></v-app-bar-nav-icon>
           
        </template>
        <span>播放列表</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small
            v-bind="attrs"
            v-on="on"
            @click="handleNewWindow"
            >
            <v-icon>mdi-download-box-outline</v-icon>
          </v-btn>
      
        </template>
        <span>下载窗口</span>
      </v-tooltip>

    </v-app-bar>

    <v-main>
      <v-container style="height:100%;padding:0px;" >
        <d-player ref="dpplayer" :options="options" style="width:100%;height:100%;"></d-player>    
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'
  export default {
    components: {
        'd-player': VueDPlayer
    },
    data: () => ({
      drawer: false,
      links: [],
      options: {
            video: {
                type: 'hls',
                //url: 'http://localhost:8099/m3u8/index.m3u8',
                //pic: './loading.png',
            },
            //autoplay: false,         
            //theme: '#1976d2',
            //screenshot: false,
                
            // danmaku: {
            //     id: 0,
            //     api: 'http://ywd.fun/danmaku',
            // },
            // contextmenu: [{
            //     text: '主站',
            //     click: ( ) => {
            //         this.$electron.shell.openExternal('http://9khezi.com');
            //     }
            // }],
            // vod_name: '',
            // ji_name: '',
            // testfunc: function() { 
            // }
      },
    }),
    mounted:function(){
        this.queryList();
    },
    methods:{
      handleNewWindow(){
          window.ipcRenderer.sendSync("handleShowWindow",{});
      },
      queryList(){
        this.links = [];
        
        var result = window.ipcRenderer.sendSync("handleQueryAllM3u8",{});
        console.log('queryList',result);
        this.links = result.data; 
        this.selectedItem = 0;
      },
      handleShowDelDialog(link){
        console.log(link);
        if(confirm(`${link.folder_name},${link.title}`)){
          console.log('true');
          var arg= {
            id:link.id,
            folder_name:link.folder_name
          };
          let result = window.ipcRenderer.sendSync("handleDeleteM3u8Sync",arg);
          console.log('handleShowDelDialog',result);
          this.queryList();
        }
        //this.delDialog.item = link;
        //this.delDialog.visiable = true;
      },
      handleShowEditDialog(link){
        console.log(link);
         //this.editDialog.item = link;
         //this.editDialog.visiable=true;
         //this.queryList();
      },
      handlePlay(link){
        this.$refs.dpplayer.dp.pause();
        var url = `http://localhost:9001/${link.folder_name}/index.m3u8`;
        console.log(link);
        this.$refs.dpplayer.dp.switchVideo({ url: url});
        this.$refs.dpplayer.dp.play();
        //this.drawer = false;
      },
    }
  }
</script>