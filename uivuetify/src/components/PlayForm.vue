<template>
  <v-app id="inspire"> 

    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-system-bar></v-system-bar>
      <!-- {{selectedItem}} -->
      <v-btn-toggle  >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">             
            <v-btn 
              v-bind="attrs"
              v-on="on"
              @click="handleNewWindow"
            >
              New
              <!-- <v-icon>mdi-table-arrow-down</v-icon> -->
            </v-btn>
          </template>
          <span>打开下载页面</span>
        </v-tooltip>      

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">             
            <v-btn 
              v-bind="attrs"
              v-on="on"
              @click='handleEdit'
            >
              Edit
              <!-- <v-icon>mdi-table-edit</v-icon> -->
            </v-btn>
          </template>
          <span>编辑</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">             
            <v-btn 
              v-bind="attrs"
              v-on="on"
              @click="handleShowDelDialog"
            >
              Del
              <!-- <v-icon>mdi-trash-can-outline</v-icon> -->
            </v-btn>
          </template>
          <span>删除</span>
        </v-tooltip> 

        <v-btn 
          @click="handleRefresh"
        >
          <!-- <v-icon>mdi-refresh</v-icon> -->
          Refr
        </v-btn>
      </v-btn-toggle>

      <v-text-field style='padding-top:8px;padding-right:5px;padding-left:5px;'
        dense
        label='文件夹名称'
        v-model="inputFolderName"
        hide-details
        >
          <template v-slot:append>
            <v-tooltip
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="handleGoPlay">
                  mdi-motion-play-outline
                </v-icon>
              </template>
              播放指定视频
            </v-tooltip>
          </template>
      </v-text-field>
       
      <v-list dense>
        <v-list-item-group
        v-model="selectedItem"
        color="primary"
        >
          <v-list-item
            v-for="(link,index) in links"
            :key="index"
            link
          >
            <v-list-item-content>
              <v-list-item-title @click="handlePlay(link)">{{ link.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
           
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container style="height:100%;padding:0px;" fluid>
        <d-player ref="dpplayer" :options="options" style="width:100%;height:100%;" ></d-player>    
      </v-container>
    </v-main>
    <v-snackbar
      v-model="snackbarToast.snackbar"
      timeout="2000"
      top
      centered
      color="primary"
    >
      {{ snackbarToast.text }} 
    </v-snackbar>

    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    > 
      <v-card>
        <v-card-title class="text-h5">
          注意
        </v-card-title>
        <v-card-text>删除,{{deltitle}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="handleDel"
          >
            确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'
//const rendererService  = require('../rendererService');
var _ = require('lodash');
  export default {
    name:'playForm',
    components: {
        'd-player': VueDPlayer
    },created:function(){
      
    },
    data: () => ({
      snackbarToast:{snackbar:false,text:''},
      selectedItem:0,
      inputFolderName:'',
      cards: ['Today', 'Yesterday'],
      drawer: null,
      links: [],
      dialog: false,
      deltitle:'',
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
      queryList(){
        this.links = [];
        
        var result = window.ipcRenderer.sendSync("handleQueryAllM3u8",{});
        console.log(result);
        this.links = result.data; 
        this.selectedItem = 0;
      },
      handleRefresh(){
        this.queryList();
      },
      handleEdit(){
        if(this.inputFolderName.length == 0){
          alert('输入名称')
          return ;
        }
        if(this.selectedItem == undefined){
          alert('选择');
          return ;
        }
        var cur = this.links[this.selectedItem];
        var arg = {
          id:cur.id,
          title:this.inputFolderName
        };
        window.ipcRenderer.sendSync("handleUpdateTitle",arg);

        this.queryList();
      },
      handleShowDelDialog(){
        if(this.selectedItem == undefined){
          alert('选择');
          return ;
        }
        var cur = this.links[this.selectedItem];
        this.deltitle = cur.title;
        this.dialog = true;
      },
      handleDel(){
        //this.dialog = true;
        console.log(this.selectedItem);
        console.log(this.links[this.selectedItem]);
        if(this.selectedItem == undefined){
          alert('选择');
          return ;
        }
        var cur = this.links[this.selectedItem];
        var arg = {
          id:cur.id,
          folder_name:cur.folder_name
        };
        window.ipcRenderer.sendSync("handleDeleteM3u8Sync",arg);

        this.queryList();
        this.dialog = false;
      },
      handleNewWindow(){
          window.ipcRenderer.sendSync("handleShowWindow",{});
      },
      handleGoPlay(){
        if(_.isEmpty(this.inputFolderName)){
          this.snackbarToast.text = '输入内容';
          this.snackbarToast.snackbar = true;
          return ;
        }
        this.$refs.dpplayer.dp.pause();
        var url = `http://localhost:9001/${this.inputFolderName}/index.m3u8`;
        console.log(url);
        this.$refs.dpplayer.dp.switchVideo({ url: url});
        this.$refs.dpplayer.dp.play();
      },
      handlePlay(link){
        this.$refs.dpplayer.dp.pause();
        var url = `http://localhost:9001/${link.folder_name}/index.m3u8`;
        console.log(url);
        this.$refs.dpplayer.dp.switchVideo({ url: url});
        this.$refs.dpplayer.dp.play();
      }
    }
  }
</script>