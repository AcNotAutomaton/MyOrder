const TokenKey = 'User-Token'

// 获取token
export function getToken() {
  return uni.getStorageSync(TokenKey)
}

// 设置token
export function setToken(token) {
  return uni.setStorageSync(TokenKey, token)
}

// 移除token
export function removeToken() {
  return uni.removeStorageSync(TokenKey)
} 