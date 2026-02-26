/// <reference types='@dcloudio/types' />
// eslint-disable-next-line import/no-unresolved
import Vue from 'vue';
declare module 'vue/types/options' {
  type Hooks = App.AppInstance & Page.PageInstance;
  interface ComponentOptions<_V extends Vue> extends Hooks {
    /**
     * 组件类型
     */
    mpType?: string;
  }
}
