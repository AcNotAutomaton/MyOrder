"use strict";
const utils_request = require("../utils/request.js");
const userApi = {
  // 微信登录
  wxLogin(data) {
    return utils_request.request.post("/user/wx-login", {
      code: data.code,
      nickName: data.userInfo.nickName,
      avatarUrl: data.userInfo.avatarUrl,
      gender: data.userInfo.gender
    });
  },
  // 更新用户信息
  updateUserInfo(data) {
    return utils_request.request.put("/user/info", data);
  },
  // 退出登录
  logout() {
    return utils_request.request.post("/user/logout");
  }
};
const menuApi = {
  // 获取所有菜品
  getMenuItems() {
    return utils_request.request.get("/api/menu-items");
  },
  // 获取单个菜品详情
  getMenuItem(id) {
    return utils_request.request.get(`/api/menu-items/${id}`);
  },
  // 获取推荐菜品
  getRecommendItems() {
    return utils_request.request.get("/api/menu-items/recommend");
  },
  // 获取热销菜品
  getHotItems(page = 0, size = 10) {
    return utils_request.request.get("/api/menu-items/hot", null, {
      page,
      size
    });
  },
  // 根据分类获取菜品
  getMenuItemsByCategory(categoryId) {
    return utils_request.request.get(`/api/menu-items/category/${categoryId}`);
  },
  // 搜索菜品
  searchMenuItems(keyword) {
    return utils_request.request.get("/api/menu-items/search", null, {
      keyword
      // 直接传递参数对象
    });
  }
};
const cartApi = {
  // 获取购物车
  getCartItems(userId) {
    return utils_request.request.get(`/api/cart/user/${userId}`);
  },
  // 保存购物车项（添加或更新）
  saveCartItem(data) {
    return utils_request.request.post(`/api/cart/save`, data);
  },
  // 删除购物车项
  removeCartItem(userId, menuItemId) {
    return utils_request.request.delete(`/api/cart/${userId}/${menuItemId}`);
  },
  // 清空购物车
  clearCart(userId) {
    return utils_request.request.delete(`/api/cart/${userId}`);
  }
};
const orderApi = {
  // 创建订单
  createOrder(userId) {
    return utils_request.request.post(`/api/orders/create/${userId}`);
  },
  // 获取订单详情
  getOrderDetails(orderId) {
    return utils_request.request.get(`/api/orders/${orderId}`);
  },
  // 获取微信支付参数
  getWxPayParams(orderId) {
    return utils_request.request.get(`/api/orders/${orderId}/wx-pay-params`);
  },
  // 完成支付
  payOrder(orderId) {
    return utils_request.request.post(`/api/orders/${orderId}/pay`);
  },
  // 取消订单
  cancelOrder(orderId) {
    return utils_request.request.post(`/api/orders/${orderId}/cancel`);
  },
  // 删除订单
  deleteOrder(orderId) {
    return utils_request.request.delete(`/api/orders/${orderId}`);
  },
  // 获取用户订单（分页）
  getUserOrders({ userId, page = 0, size = 10, status = "" }) {
    return utils_request.request.get(`/api/orders/user/${userId}`, null, {
      page,
      size,
      status
    });
  }
};
const categoryApi = {
  // 获取所有分类
  getAllCategories() {
    return utils_request.request.get("/api/categories/all");
  },
  // 根据分类获取菜品
  getMenuItemsByCategory(categoryId) {
    return utils_request.request.get(`/menu-items/category/${categoryId}`);
  },
  // 创建分类
  createCategory(data) {
    return utils_request.request.post("/categories", data);
  },
  // 更新分类
  updateCategory(id, data) {
    return utils_request.request.put(`/categories/${id}`, data);
  },
  // 删除分类
  deleteCategory(id) {
    return utils_request.request.delete(`/categories/${id}`);
  }
};
exports.cartApi = cartApi;
exports.categoryApi = categoryApi;
exports.menuApi = menuApi;
exports.orderApi = orderApi;
exports.userApi = userApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/index.js.map
