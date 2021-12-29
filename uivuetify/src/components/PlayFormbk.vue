<template>
    <div>
        <d-player ref="dpplayer" :options="options" style="width:100%;height:100%;" ></d-player>    
    </div>
</template>
<script>
import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'

export default {
    name:'playForm',
    components: {
        'd-player': VueDPlayer
    },
    data(){
        return {
            options: {
            video: {
                type: 'hls',
                url: 'http://localhost:8099/m3u8/index.m3u8',
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
        };
    },
}
</script>