// #ifndef VUE3
import * as Vue from 'vue'
const app = new Vue.default({
  ...App
})

import App from './App'

Vue.default.config.productionTip = false
App.mpType = 'app'

app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif