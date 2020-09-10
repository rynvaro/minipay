import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Hello from '../components/ApiData'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    // 在这里引用我们的组件
    {
      path: '/test',
      name: 'Hello',
      component: Hello
    }
  ]
})
