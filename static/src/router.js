import Vue from 'vue'
import VueRouter from 'vue-router'
import User from './api/user'

Vue.use(VueRouter)

function load (component) {
  return () => System.import(`components/${component}.vue`)
}

var router = new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    { path: '/',
      component: load('Index'),
      children: [
        {
          path: 'monitor',
          component: load('Index/Monitor')
        },
        {
          path: 'brew',
          component: load('Index/Brew')
        }
      ]}, // Default
    { path: '*', component: load('Error404') }, // Not found
    { path: '/login', component: load('Login') }
  ]
})

router.beforeEach((to, from, next) => {
  console.log(to.path)
  if (to.path !== '/login') {
    User.getStatus()
      .then(data => {
        return next()
      }).catch(e => {
        return next('/login')
      })
  }
  else {
    return next()
  }
})

export default router
