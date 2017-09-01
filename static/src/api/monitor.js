import {apiMonitor} from './index'

export default {
  toggleRelay: (id) => apiMonitor.post(`/relay/toggle/${id}`),
  getSensorBuffer: (nobuffer) => apiMonitor.get(`/sensor`, {params: { nobuffer: nobuffer }}),
  clearSensorData: () => apiMonitor.post('/sensor/clear')
}
