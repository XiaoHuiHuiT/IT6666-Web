import axios from 'axios'
import { MessageBox, Message, Notification } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  // url = baseURL + requestURL
  baseURL: process.env.VUE_APP_BASE_API,
  // 设置请求超时间
  timeout: 5000
})

// 请求拦截
service.interceptors.request.use(
  config => {
    // 在发送请求之前把token放到请求头里面
    if (store.getters.token) {
      // 这里的token和后端的保持一样
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(
  response => {
    // response.data 里面的数据才是后台返回给我们的数据
    const res = response.data
    if (res.code === 401) {
      // 身份过期
      MessageBox.confirm('用户登陆身份已过期，请重新登陆', '系统提示', {
        confirmButtonText: '重新登陆',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 跳到登陆页面重新登陆
        store.dispatch('user/logout').then(() => {
          location.reload()
        })
      })
    } else if (res.code === 500) {
      Notification.error({
        title: '服务器内部出现异常，请联系管理员'
      })
      // 记录错
      return Promise.reject('error')
      // 可能是其它参数出错
    } else if (res.code === 400) {
      Notification.error({
        title: res.msg
      })
      // 记录错
      return Promise.reject('error')
      // 可能是其它参数出错
    } else if (res.code !== 200) {
      Notification.error({
        title: res.msg
      })
      // 记录错
      return Promise.reject('error')
    } else {
      // 以上验证通过之后再放行
      return res
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
