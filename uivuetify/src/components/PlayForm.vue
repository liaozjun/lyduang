<template>
  <v-app id="inspire">
    <v-card>
      <v-tabs        
        show-arrows
      >
        <v-tabs-slider color="teal lighten-3"></v-tabs-slider>

        <v-tab
          v-for="item in menus"
          :key="item.index"
          @click="ontabclick(item)"
        >
          {{item.title}}
        </v-tab>
         
          <!-- <v-text-field style='padding-top:8px;padding-right:5px;padding-left:5px;'
            width=368
            dense
            solo
            label='文件夹名称'
            v-model="inputFolderName"
            hide-details
            >
              <template v-slot:append>
                <v-tooltip
                  bottom
                >
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" @click="handleGoPlay">
                      123
                    </v-btn>
                  </template>
                  播放指定视频
                </v-tooltip>
              </template>
          </v-text-field> -->
        
      </v-tabs>
    </v-card>
    

    <v-main >
      <v-container style="height:100%;padding:0px;" >
        <d-player ref="dpplayer" :options="options" style="width:100%;height:100%;"></d-player>    
      </v-container>
    </v-main>

    <v-navigation-drawer
      v-model="drawer"
      absolute      
      
      width=400
    >
      <v-card class="overflow-hidden">
        <v-app-bar
          absolute
          color="white"
          elevate-on-scroll
          scroll-target="#scrolling-techniques-7"
        >
          <v-app-bar-nav-icon></v-app-bar-nav-icon>

          <v-toolbar-title>Title</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn @click="drawer = false" icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-heart</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-app-bar>
        <v-sheet
          id="scrolling-techniques-7"
          class="overflow-y-auto"
          max-height="100vh"
        >
          <v-container style="padding-top:64px;">
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
          </v-container>
        </v-sheet>
      </v-card>
    </v-navigation-drawer>

    <v-snackbar
      v-model="snackbarToast.snackbar"
      timeout="2000"
      top
      centered
      color="primary"
    >
      {{ snackbarToast.text }} 
    </v-snackbar>
    <!-- 编辑对话框 -->
    <v-dialog
      v-model="editDialog.visiable"
      persistent
      max-width="50%"
    > 
      <v-card>
        <v-card-title class="text-h5">
          注意
        </v-card-title>
        <v-card-text>编辑</v-card-text>
        <v-text-field
            label="名称"
            solo
            v-model="editDialog.item.title"
          ></v-text-field>
          
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="editDialog.visiable = false"
          >
            取消
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="handleEdit"
          >
            确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 删除对话框 -->
    <v-dialog
      v-model="delDialog.visiable"
      persistent
      max-width="290"
    > 
      <v-card>
        <v-card-title class="text-h5">
          注意
        </v-card-title>
        <v-card-text>删除,{{delDialog.item!=null?delDialog.item.title:""}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="delDialog.visiable = false"
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
      menus:[
        {index:1,name:'play_list',title:'播放列表'},
        {index:2,name:'new_download',title:'新建下载'}
      ],
      snackbarToast:{snackbar:false,text:''},
      selectedItem:0,
      inputFolderName:'',
      cards: ['Today', 'Yesterday'],
      drawer: false,
      links: [],
      delDialog: {
        visiable:false,
        item:{}
      },
      editDialog:{
        visiable:false,
        item:{}
      },
       
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
      ontabclick(item){
        console.log(item);
        if(item.index == 1){
          this.drawer = true;
        }else if(item.index == 2){
          this.handleNewWindow();
        }
      },
      queryList(){
        this.links = [];
        
        var result = window.ipcRenderer.sendSync("handleQueryAllM3u8",{});
        //console.log(result);
        this.links = result.data; 
        this.selectedItem = 0;
      },
      handleRefresh(){
        this.queryList();
      },
      handleShowEditDialog(link){
         this.editDialog.item = link;
         this.editDialog.visiable=true;
         this.queryList();
      },
      handleEdit(){
        var arg = {
          id:this.editDialog.item.id,
          title:this.editDialog.item.title
        };
        console.log(arg);
        var result = window.ipcRenderer.sendSync("handleUpdateTitle",arg);
        console.log(result);
        
        this.editDialog.visiable = false;
        this.editDialog.item = {};
      },

      handleShowDelDialog(link){
        this.delDialog.item = link;
        this.delDialog.visiable = true;
      },
      handleDel(){
        var cur = this.delDialog.item;
        var arg = {
          id:cur.id,
          folder_name:cur.folder_name
        };
        window.ipcRenderer.sendSync("handleDeleteM3u8Sync",arg);

        this.queryList();
        this.delDialog.visiable = false;
        this.delDialog.item = {};
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
        this.drawer = false;
      }
    }
  }
</script>