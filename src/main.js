import Vue from 'vue';
import App from './App';
import DemoBaseMixin from './mixins/demo-base';
import './uni.promisify.adaptor';
import './style/app.less';

import TDemo from 'tdesign-uniapp/demo/demo.vue';
import TNavbar from 'tdesign-uniapp/navbar/navbar.vue';
import TDemoHeader from 'tdesign-uniapp/demo-header/demo-header.vue';
import TDemoNavbar from 'tdesign-uniapp/demo-navbar/demo-navbar.vue';


Vue.config.productionTip = false;
Vue.mixin(DemoBaseMixin);
Vue.component('t-demo', TDemo);
Vue.component('t-demo-header', TDemoHeader);
Vue.component('t-demo-navbar', TDemoNavbar);
Vue.component('t-navbar', TNavbar);


App.mpType = 'app';

const app = new Vue({
  ...App,
});


app.$mount();
