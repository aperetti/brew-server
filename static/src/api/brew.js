import {apiBrew} from './index'

export default {
  getById: (id) => apiBrew.get(`/id/${id}`),
  postById: (id, brew) => apiBrew.post(`/id/${id}`, brew),
  getList: () => apiBrew.get(`/list`),
  postNew: (brew) => apiBrew.post(`/new`, brew),
  getSchema: () => apiBrew.get('/schema'),
  deleteById: (id) => apiBrew.delete(`/id/${id}`),
  getStatusEnum: () => apiBrew.get('/status/enum')
}
