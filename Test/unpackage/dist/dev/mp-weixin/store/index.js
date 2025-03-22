"use strict";
const common_vendor = require("../common/vendor.js");
const api_index = require("../api/index.js");
const store = {
  state: {
    isLoggedIn: false,
    currentUser: null,
    token: common_vendor.index.getStorageSync("token") || "",
    userId: common_vendor.index.getStorageSync("userId") || "",
    userInfo: common_vendor.index.getStorageSync("userInfo") || null,
    currentCategoryId: null
  },
  setCurrentCategoryId(categoryId) {
    this.state.currentCategoryId = categoryId;
  },
  getCurrentCategoryId() {
    return this.state.currentCategoryId;
  },
  // 获取用户ID
  getUserId() {
    return this.state.userId || common_vendor.index.getStorageSync("userId");
  },
  // 检查登录状态
  checkLogin() {
    return this.state.isLoggedIn && this.state.userId;
  },
  setUserId(userId) {
    this.state.userId = userId;
    common_vendor.index.setStorageSync("userId", userId);
  },
  login(user, token) {
    this.setUserId(user.id);
    this.state.isLoggedIn = true;
    this.state.currentUser = user;
    this.state.token = token;
    common_vendor.index.__f__("log", "at store/index.js:41", "用户ID:", user.id);
    common_vendor.index.setStorageSync("token", token);
    common_vendor.index.setStorageSync("userInfo", JSON.stringify(user));
    common_vendor.index.setStorageSync("userId", user.id);
  },
  async logout() {
    try {
      await api_index.userApi.logout();
    } catch (error) {
      common_vendor.index.__f__("error", "at store/index.js:54", "退出登录失败:", error);
    } finally {
      this.state.isLoggedIn = false;
      this.state.currentUser = null;
      this.state.token = "";
      this.state.userId = "";
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("userId");
    }
  },
  initUserState() {
    const userInfo = common_vendor.index.getStorageSync("userInfo");
    const userId = common_vendor.index.getStorageSync("userId");
    if (userInfo) {
      this.state.currentUser = JSON.parse(userInfo);
      this.state.isLoggedIn = true;
      this.state.userId = userId;
    }
  },
  async updateCartBadge() {
    try {
      const userId = this.getUserId();
      if (userId) {
        const cartItems = await api_index.cartApi.getCartItems(userId);
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (totalCount > 0) {
          common_vendor.index.setTabBarBadge({
            index: 2,
            // 购物车的 tabBar 索引
            text: totalCount.toString()
          });
        } else {
          common_vendor.index.removeTabBarBadge({
            index: 2
          });
        }
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at store/index.js:98", "更新购物车角标失败:", error);
    }
  }
};
exports.store = store;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/index.js.map
