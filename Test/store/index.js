import { userApi, cartApi } from "@/api"

const store = {
  state: {
    isLoggedIn: false,
    currentUser: null,
    token: uni.getStorageSync('token') || '',
    userId: uni.getStorageSync('userId') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    currentCategoryId: null,
  },
  
  setCurrentCategoryId(categoryId) {
    this.state.currentCategoryId = categoryId
  },
  getCurrentCategoryId() {
    return this.state.currentCategoryId
  },

  // 获取用户ID
  getUserId() {
    return this.state.userId || uni.getStorageSync('userId')
  },
  
  // 检查登录状态
  checkLogin() {
    return this.state.isLoggedIn && this.state.userId
  },
  
  setUserId(userId) {
    this.state.userId = userId
    uni.setStorageSync('userId', userId)
  },
  
  login(user, token) {
    this.setUserId(user.id)
    this.state.isLoggedIn = true
    this.state.currentUser = user
    this.state.token = token
    
    console.log('用户ID:', user.id)
    
    // 持久化存储
    uni.setStorageSync('token', token)
    uni.setStorageSync('userInfo', JSON.stringify(user))
    uni.setStorageSync('userId', user.id)
  },
  
  async logout() {
    try {
      // 调用后端退出登录接口
      await userApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除状态
      this.state.isLoggedIn = false
      this.state.currentUser = null
      this.state.token = ''
      this.state.userId = ''
      
      // 清除存储
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('userId')
    }
  },
  
  initUserState() {
    const userInfo = uni.getStorageSync('userInfo')
    const userId = uni.getStorageSync('userId')
    if (userInfo) {
      this.state.currentUser = JSON.parse(userInfo)
      this.state.isLoggedIn = true
      this.state.userId = userId
    }
  },

  async updateCartBadge() {
    try {
      const userId = this.getUserId()
      if (userId) {
        const cartItems = await cartApi.getCartItems(userId)
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
        
        if (totalCount > 0) {
          uni.setTabBarBadge({
            index: 2, // 购物车的 tabBar 索引
            text: totalCount.toString(),
          })
        } else {
          uni.removeTabBarBadge({
            index: 2,
          })
        }
      }
    } catch (error) {
      console.error('更新购物车角标失败:', error)
    }
  },
}

export default store 