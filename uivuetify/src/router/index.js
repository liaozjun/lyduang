import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'playForm',
            component: require('@/components/PlayForm').default
        },
        {
            path: '/DownloadPage/:winId',
            name: 'downloadPage',
            component: require('@/components/DownloadPage').default,
        },
    ]
});