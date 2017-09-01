<template>
  <div>
    <div class="shadow-2" style="padding:10px;">
      <div class="row wrap large-gutter sm-column">
        <div class="width-1of3 ">
          <div class="small-gutter row wrap" style="padding-top: 10px;">
            <button class="width-1of8" @click="newBrew">New Brew</button>
            <button class="width-1of8" @click="deleteBrew">Delete Brew</button>
            </div>
            <div class="small-gutter row">
            <q-select class="width-1of1" type="radio" v-model="brewId" :options="brewList" label="Select Brew"></q-select>
            <label style="padding-left: 20px; padding-top: 20px;" class="width-1of3">
              <q-toggle icon="edit" v-model="edit"></q-toggle>
              Edit
            </label>
          </div>
          <div v-if="brew.name" class="width-1of1">
            <div class="row wrap small-gutter">
              <div class="width-2of3">
                <div class="stacked-label">
                  <input :readonly=!edit class="full-width" v-model.lazy="brew.name">
                  <label>Brew</label>
                </div>
              </div>
              <div class="width-1of3">
                <div class="stacked-label">
                  <input class="full-width" :readonly=!edit v-model.lazy.number="brew.batchSize">
                  <label>Batch Size</label>
                </div>  
              </div>
            </div>
            <div class="row wrap small-gutter">
              <div class="width-1of3">
                <q-select type="radio" v-model="brew.status" class="full-width" :options="statusEnum" label="Status"></q-select>
              </div>
              <div class="width-1of3">
                <q-select type="radio" v-model="brew.sensorId" class="full-width" :options="sensorList" label="Sensor"></q-select>
              </div>
              <div class="width-1of3">
                <q-datetime :readonly=!edit v-model="brew.date" type="date" class="full-width" label="Brew Date"></q-datetime>
              </div>
            </div>
            <div>
              <div class="stacked-label">
                <textarea rows=2 class="full-width" v-model.lazy="brew.notes"></textarea>
                <label>Notes</label>
              </div>
            </div>
          </div>
        </div>
        <div class="width-2of3" v-if="brew && brew.steps">
          <h2>{{brew.steps[step-1].name}}</h2>
          <blockquote>{{brew.steps[step-1].recommendations}}</blockquote>
          <div class="stacked-label">
            <textarea rows=10 class="full-width" v-model.lazy="brew.steps[step-1].notes"></textarea>
            <label>Notes</label>
          </div>
          <div class="row small-gutter" style="padding-top:10px">
            <div class="width-1of2">
              <div class="stacked-label">
                <input class="full-width" :readonly=!edit v-model.lazy.number="brew.steps[step-1].targetTemp">
                <label>Target Temperature (°F)</label>
              </div>  
            </div>
            <div class="width-1of2">
              <div class="stacked-label">
                <input class="full-width" :readonly=!edit v-model.lazy.number="brew.steps[step-1].timer">
                <label>Time (minutes)</label>
              </div>  
            </div> 
          </div>
          <div class="row">
            <div class="width-1of2" v-if="sensorTemp">
              <h4>{{sensorTemp}}°F</h4>
            </div>
            <div>
              <q-select :readonly=!edit :options='alarmModes' v-model='alarmMode' label='Temperature Alarm'></q-select>
            </div>
          </div>
          <div class="row">
            <div class="width-1of1" v-if="brew.steps[step-1].timer">
              <label>Time (minutes)</label>
              <q-progress  :percentage="taskPercent" :class="['dark', brew.steps[step-1].endTime === 0 ? 'stripe animate' : '']"></q-progress>
            </div>
          </div>
          <button @click="start(step-1)" v-if="brew.steps[step-1].status === 'Planning'">Start</button>
          <button v-if="brew.steps[step-1].status === 'In Progress'" @click="finish(step-1)">Finish</button>
          <button v-if="brew.steps[step-1].status === 'Complete'" @click="restart(step-1)">Restart</button> 
          <q-pagination v-model="step" :max="brew.steps.length"></q-pagination>
        </div>
      </div>
    </div>  
  </div>
</template>
<script>
  const modes = [
    {label: 'No Alarm', value: null},
    {label: 'Maintain (Min)', value: 'min'},
    {label: 'Maintain (Max)', value: 'max'},
    {label: 'Target', value: 'target'}
  ]

  function showNotification () {}
  import { Toast } from 'quasar'
  import Brew from '../../api/brew'
  import monitor from '../../api/monitor'
  export default {
    name: 'brew',
    data () {
      return {
        alarm: false,
        alarmMode: null,
        alarmModes: modes,
        sensorTemp: null,
        taskPercent: 0,
        statusEnum: [],
        brewId: 0,
        edit: true,
        brew: {},
        brewList: [],
        step: 1,
        sensorList: [],
        disableWatch: false
      }
    },
    props: ['brewProp'],
    mounted () {
      showNotification()
      monitor.getSensorBuffer(true).then(res => {
        this.sensorList = res.data.map(el => Object.assign({}, {label: el.alias || el.sensor, value: el.sensor}))
      })
      this.$on('brewUpdate', (id) => {
        if (id === this.brewProp) {
          this.syncBrew()
          this.syncBrewList()
          Toast.create({
            html: 'Brew synced!',
            timeout: 1500,
            icon: 'info',
            button: {
              color: '#fff'
            }
          })
        }
      })
      this.$on('sensor', (id, temp) => {
        if (id === this.brew.sensorId) {
          this.sensorTemp = Math.round(10 * temp) / 10
        }
      })
      this.brewId = this.brewProp
      setInterval(() => {
        this.calcPercent()
      }, 1000)
      this.syncBrewList()
      Brew.getStatusEnum().then(res => {
        this.statusEnum = res.data.map(el => Object.assign({}, {label: el, value: el}))
      })
      if (this.brewId) {
        this.syncBrew()
      }
    },
    computed: {
    },
    watch: {
      brew: {
        handler: function (val, oldVal) {
          if (!this.disableWatch) {
            this.saveBrew()
            this.syncBrewList()
          }
        },
        deep: true
      },
      brewId: function (val, oldVal) {
        if (!this.disableWatch) {
          console.log('Syncing brew')
          this.syncBrew()
          this.$emit('brew', this.brewId)
        }
      }
    },
    methods: {
      calcPercent () {
        var step = this.brew && this.brew.steps ? this.brew.steps[this.step - 1] : {}
        if (step.endTime) {
          this.taskPercent = 100
        }
        else if (step.startTime) {
          var percent = 100 * ((Date.now() - step.startTime) / (1000 * 60)) / step.timer
          this.taskPercent = percent
        }
        else {
          this.taskPercent = 0
        }
      },
      timeElapsed (st) {
        var step = this.brew.steps[st]
        if (step.endTime) {
          return (step.endTime - step.startTime) / 1000 / 60
        }
        else if (step.startTime) {
          return (step.startTime - Date.now()) / 1000 / 60
        }
        else {
          return 0
        }
      },
      start (step) {
        this.brew.steps[step].status = 'In Progress'
        this.brew.steps[step].startTime = Date.now()
      },
      finish (step) {
        this.brew.steps[step].status = 'Complete'
        this.brew.steps[step].endTime = Date.now()
      },
      restart (step) {
        this.brew.steps[step].status = 'Planning'
        this.brew.steps[step].endTime = 0
        this.brew.steps[step].startTime = 0
      },
      syncBrewList () {
        Brew.getList().then((res) => {
          this.brewList = res.data.map(el => Object.assign({}, {label: el.name, value: el.id}))
        })
      },
      syncBrew () {
        if (this.brewId) {
          this.disableWatch = true
          Brew.getById(this.brewId).then(res => {
            this.brew = Object.assign({}, res.data)
            this.syncBrewList()
            this.$nextTick(() => {
              this.disableWatch = false
            })
          }).catch(e => {
            this.disableWatch = false
            Toast.create.negative({
              html: 'Could not grab Brew',
              timeout: 2500,
              button: {
                color: '#fff'
              }
            })
          })
        }
      },
      saveBrew () {
        Brew.postById(this.brew.id, this.brew).then((res) => {
        })
      },
      newBrew () {
        Brew.postNew().then((res) => {
          this.brew = res.data
          this.brewId = res.data.id
        })
      },
      deleteBrew () {
        Brew.deleteById(this.brew.id).then(res => {
          this.brew = []
          this.syncBrewList()
        })
      }
    }
  }
</script>
