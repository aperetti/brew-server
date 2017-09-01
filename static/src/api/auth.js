import axios from 'axios'
import {apiAuth} from './index'

export default {
  getToken: (username, password) => {
    return axios.post(apiAuth + '/login', {username: username, password: password})
  }
}
