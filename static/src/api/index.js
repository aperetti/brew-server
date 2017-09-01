import axios from 'axios'

function extendWithToken (axios, base) {
  var extend = axios.create({
    baseURL: base
  })
  extend.interceptors.request.use(function (config) {
    config.headers.authorization = 'Bearer ' + token()
    return config
  })
  return extend
}
export const token = () => {
  return getLocal('token')
}

var domainBase = 'http://localhost:9082/'
export const apiAuth = domainBase + 'auth'

export const apiBrew = extendWithToken(axios, domainBase + 'brew')
export const apiMonitor = extendWithToken(axios, domainBase + 'monitor')
export const apiUser = extendWithToken(axios, domainBase + 'user')
export const apiKegs = extendWithToken(axios, domainBase + 'kegs')
function getLocal (str) { return window.localStorage.getItem(str) }
