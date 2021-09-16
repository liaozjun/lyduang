<template>
  <v-app id="inspire"> 

    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-item>
          <v-text-field
          prepend-icon="mdi-map-marker"
          @click:prepend="handleNewWindow"
          dense 
          solo
          v-model="inputFolderName"
          append-icon="mdi-map-marker"
          @click:append="handleGoPlay"
          ></v-text-field>
        </v-list-item>
        <v-list-item
          v-for="link in links"
          :key="link.id"
          link
        >

          <v-list-item-content>
            <v-list-item-title @click="handlePlay(link)">{{ link.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container style="height:100%;" >
        <d-player ref="dpplayer" :options="options" style="width:100%;height:100%;" ></d-player>    
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'

  export default {
    name:'playForm',
    components: {
        'd-player': VueDPlayer
    },
    data: () => ({
      inputFolderName:'',
      cards: ['Today', 'Yesterday'],
      drawer: null,
      links: [
        ['mdi-inbox-arrow-down', 'Inbox'],
        ['mdi-send', 'Send'],
        ['mdi-delete', 'Trash'],
        ['mdi-alert-octagon', 'Spam'],
      ],
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
        var result = window.ipcRenderer.sendSync("handleQueryAllM3u8",{});
        console.log(result);
        this.links = result.data; 
    },
    methods:{
        handleNewWindow(){
           window.ipcRenderer.sendSync("handleShowWindow",{});
        },
        handleGoPlay(){
          var url = `http://localhost:9001/${this.inputFolderName}/index.m3u8`;
          console.log(url);
          this.$refs.dpplayer.dp.switchVideo({ url: url});
        },
        handlePlay(link){            
          var url = `http://localhost:9001/${link.folder_name}/index.m3u8`;
          console.log(url);
          this.$refs.dpplayer.dp.switchVideo({ url: url});
        }
    }
  }
</script>