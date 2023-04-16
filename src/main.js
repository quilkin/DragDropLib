import { createApp } from 'vue'
import App from './App.vue'
import { Draggable  } from './draggable.js'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})
import '../assets/main.css';


createApp(App).use(vuetify).mount('#app')
