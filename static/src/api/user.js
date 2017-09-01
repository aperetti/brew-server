import {apiUser} from './index'

export default {
  getStatus: () => apiUser.get('/status'),
  setSensorAliases: (sensors) => apiUser.post('/sensor_aliases', sensors)
}
