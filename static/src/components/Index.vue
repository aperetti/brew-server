<template>
  <q-layout>
    <q-drawer ref="leftDrawer">
      <div class="toolbar light">
        <q-toolbar-title :padding="1">
          Drawer
        </q-toolbar-title>
      </div>
      <div class="list no-border platform-delimeter">
        <q-drawer-link icon="exit_to_app"  to="/login">
          Logout
        </q-drawer-link>
        <q-drawer-link icon="assignment" to="/brew">
          Brew Log
        </q-drawer-link>
        <q-drawer-link icon="trending_up" to="/monitor">
          Monitor
        </q-drawer-link>
      </div>
    </q-drawer>
    <div slot="header" class="toolbar">
      <button class="hide-on-drawer-visible" @click="$refs.leftDrawer.open()">
        <i>menu</i>
      </button>
      <q-toolbar-title :padding="1">
       Brewen 
      </q-toolbar-title>
    </div>
    <router-view :brewProp="brewId" v-on:brew="setBrew" ref="router" class="layout-view"></router-view>
  </q-layout>
</template>

<script>
import mqtt from 'mqtt'
import _ from 'lodash'
import Brew from './Index/Brew'
export default {
  components: {
    Brew
  },
  data () {
    return {
      brewId: null
    }
  },
  mounted () {
    var client = mqtt.connect('wss://brew.photoredux.com:9095')
    client.on('connect', () => {
      console.log('loaded')
      client.subscribe('/sensor/#', {qos: 1}, function (topic) {
        console.log('Subcribed to temperature reading ', topic)
      })
      client.subscribe('/relay/#', {qos: 1}, (topic) => console.log('Subscribed to relay ', topic))
      client.subscribe('/brew', {qos: 1}, (topic) => console.log('Subscribed to brew notification ', topic))
      client.on('message', (topic, message) => {
        var topics = topic.split('/')
        if (topics[1] === 'sensor' && topics[2] === 'ds18b20') {
          if (topics.length === 4) {
            let sensor = topics[3]
            if (this.$refs.router) {
              this.$refs.router.$emit('sensor', sensor, _.toNumber(message.toString()))
            }
          }
        }
        else if (topics[1] === 'relay' && topics[2] === 'status') {
          this.$refs.router.$emit('relay', !_.toNumber(message.toString()))
        }
        else if (topics[1] === 'brew') {
          this.$refs.router.$emit('brewUpdate', message.toString())
        }
      })
    })
  },
  computed: {
    position () {
      const transform = `rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`
      return {
        top: this.moveY + 'px',
        left: this.moveX + 'px',
        '-webkit-transform': transform,
        '-ms-transform': transform,
        transform
      }
    }
  },
  methods: {
    setBrew (id) {
      this.brewId = id
    }
  }
}
</script>

<style lang="stylus">
.logo-container
  width 192px
  height 268px
  perspective 800px
  position absolute
  top 50%
  left 50%
  transform translateX(-50%) translateY(-50%)
.logo
  position absolute
  transform-style preserve-3d
.layout-view
  padding 10px
</style>
