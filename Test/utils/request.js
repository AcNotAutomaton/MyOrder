import { getToken } from '@/utils/auth'

// 配置基础URL - 根据实际环境配置
const BASE_URL = 'http://localhost:8081/api'  // 开发环境（请替换为你的电脑IP）
const TIMEOUT = 15000 // 15秒超时

// 创建请求实例
const request = (options) => {
  // 拼接完整请求路径
  let url = options.url
  // 如果options.url不是以http开头，则添加BASE_URL
  if (!url.startsWith('http')) {
    url = BASE_URL + url
  }
  
  // 处理query参数
  if (options.params) {
    const queryString = Object.entries(options.params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    url += `?${queryString}`
  }
  
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    uni.request({
      ...options,
      url,
      header,
      timeout: TIMEOUT,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token过期或无效，清除登录状态
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({
            title: '请重新登录',
            icon: 'none'
          })
          reject(new Error('未授权'))
        } else {
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        console.error('请求URL:', url)
        console.error('请求方法:', options.method)
        console.error('请求参数:', options.data)
        reject(new Error(`网络请求失败: ${err.errMsg || err.message || '未知错误'}`))
      }
    })
  })
}

// 导出请求方法
export default {
  get(url, data = {}, params = {}) {
    return request({
      url,
      method: 'GET',
      data,
      params
    })
  },

  post(url, data = {}, params = {}) {
    return request({
      url,
      method: 'POST',
      data,
      params
    })
  },
  
  put(url, data = {}) {
    return request({
      url,
      method: 'PUT',
      data
    })
  },
  
  delete(url, data = {}) {
    return request({
      url,
      method: 'DELETE',
      data
    })
  }
} 