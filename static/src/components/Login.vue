<template>
<div>
  <div class="row justify-around content-center text-center full-width" style="padding:20px;">
    <div>
      <img style="width: 100%; max-width: 500px;" src="../assets/logo.png"></img>
    </div>
  </div>
  <div class="row justify-center sm-column" style="padding: 10px;">
    <div class="width-1of5"> 
      <div class="floating-label">
        <input v-model='username' class="full-width" required/>
        <label >Username</label>
      </div>
    </div>
    <div class="width-1of5">
      <div class="floating-label">
        <input required class="full-width" @focus='error = false' v-model='password' type='password' @keyup.enter='login'>
        <label>Password</label>
      </div>
    </div>
    <div style="padding-top: 10px;" class="width-1of5">
      <button :class="['raised', error ? 'red' : '']" style='width: 100%;' @keyup.enter='login' @click='login'>Login</button>
    </div>
  </div>
</div>
</template>

<script>
import auth from '../api/auth'
export default {
  name: 'hello',
  data () {
    return {
      msg: `Tin Plated`,
      username: '',
      password: '',
      error: false
    }
  },
  mounted () {
    this.$logout()
  },
  methods: {
    login () {
      auth.getToken(this.username, this.password)
        .then(res => {
          this.$setToken(res.data.token)
          this.$router.push('monitor')
        }).catch(res => {
          this.error = true
          var that = this
          console.log(res)
          this.$setTimeout(() => {
            that.error = false
          }, 5000)
          this.username = ''
          this.password = ''
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
