import request from '@/utils/request'

// 基础路径
const baseURL = '/api'

// 用户相关接口
export const userApi = {
  // 微信登录
  wxLogin(data) {
    return request.post('/user/wx-login', {
      code: data.code,
      nickName: data.userInfo.nickName,
      avatarUrl: data.userInfo.avatarUrl,
      gender: data.userInfo.gender
    })
  },

  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data)
  },

  // 退出登录
  logout() {
    return request.post('/user/logout')
  }
}

// 菜品相关接口
export const menuApi = {
  // 获取所有菜品
  getMenuItems() {
    return request.get('/api/menu-items')
  },

  // 获取单个菜品详情
  getMenuItem(id) {
    return request.get(`/api/menu-items/${id}`)
  },

  // 获取推荐菜品
  getRecommendItems() {
    return request.get('/api/menu-items/recommend')
  },

  // 获取热销菜品
  getHotItems(page = 0, size = 10) {
    return request.get('/api/menu-items/hot', null, {
      page,
      size
    })
  },

  // 根据分类获取菜品
  getMenuItemsByCategory(categoryId) {
    return request.get(`/api/menu-items/category/${categoryId}`)
  },

  // 搜索菜品
  searchMenuItems(keyword) {
    return request.get('/api/menu-items/search', null, {
      keyword  // 直接传递参数对象
    })
  }
}

// 购物车相关接口
export const cartApi = {
  // 获取购物车
  getCartItems(userId) {
    return request.get(`/api/cart/user/${userId}`)
  },

  // 保存购物车项（添加或更新）
  saveCartItem(data) {
    return request.post(`/api/cart/save`, data)
  },

  // 删除购物车项
  removeCartItem(userId, menuItemId) {
    return request.delete(`/api/cart/${userId}/${menuItemId}`)
  },

  // 清空购物车
  clearCart(userId) {
    return request.delete(`/api/cart/${userId}`)
  }
}

// 订单相关接口
export const orderApi = {
  // 创建订单
  createOrder(userId) {
    return request.post(`/api/orders/create/${userId}`);
  },

  // 获取订单详情
  getOrderDetails(orderId) {
    return request.get(`/api/orders/${orderId}`)
  },

  // 获取微信支付参数
  getWxPayParams(orderId) {
    return request.get(`/api/orders/${orderId}/wx-pay-params`)
  },

  // 完成支付
  payOrder(orderId) {
    return request.post(`/api/orders/${orderId}/pay`)
  },

  // 取消订单
  cancelOrder(orderId) {
    return request.post(`/api/orders/${orderId}/cancel`)
  },

  // 删除订单
  deleteOrder(orderId) {
    return request.delete(`/api/orders/${orderId}`)
  },

  // 获取用户订单（分页）
  getUserOrders({ userId, page = 0, size = 10, status = '' }) {
    return request.get(`/api/orders/user/${userId}`, null, {
      page,
      size,
      status
    })
  }
}

// 商家订单管理接口
export const orderManageApi = {
  // 获取待处理订单
  getPendingOrders() {
    return request({
      url: '/api/manage/orders/pending',
      method: 'GET'
    })
  },

  // 开始处理订单
  startProcessingOrder(orderId) {
    return request({
      url: `/api/manage/orders/${orderId}/process`,
      method: 'POST'
    })
  },

  // 完成订单
  completeOrder(orderId) {
    return request({
      url: `/api/manage/orders/${orderId}/complete`,
      method: 'POST'
    })
  },

  // 获取今日订单
  getTodayOrders() {
    return request({
      url: '/api/manage/orders/today',
      method: 'GET'
    })
  }
}

// 分类相关接口
export const categoryApi = {
  // 获取所有分类
  getAllCategories() {
    return request.get('/api/categories/all')
  },

  // 根据分类获取菜品
  getMenuItemsByCategory(categoryId) {
    return request.get(`/menu-items/category/${categoryId}`)
  },

  // 创建分类
  createCategory(data) {
    return request.post('/categories', data)
  },

  // 更新分类
  updateCategory(id, data) {
    return request.put(`/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id) {
    return request.delete(`/categories/${id}`)
  }
}