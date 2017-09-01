import {apiKegs} from './index'

export default {
  new: (keg) => apiKegs.post('/new', keg),
  get: () => apiKegs.get('/'),
  save: (keg) => apiKegs.post('/save', keg),
  tap: (keg) => apiKegs.post('/tap', keg),
  kick: (keg) => apiKegs.post('/kick', keg),
  delete: (keg) => apiKegs.delete('/delete', {params: {_id: keg}})
}
