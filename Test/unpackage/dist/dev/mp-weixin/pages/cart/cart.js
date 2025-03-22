"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
const _sfc_main = {
  data() {
    return {
      cartItems: [],
      userId: ""
    };
  },
  computed: {
    totalAmount() {
      return this.cartItems.reduce((sum, item) => {
        return sum + item.itemPrice * item.quantity;
      }, 0).toFixed(2);
    }
  },
  onShow() {
    this.userId = store_index.store.getUserId();
    if (!this.userId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "请先登录后再查看购物车",
        showCancel: false,
        success: () => {
          common_vendor.index.switchTab({
            url: "/pages/menu/menu"
          });
        }
      });
      return;
    }
    this.loadCartItems();
    store_index.store.updateCartBadge();
  },
  methods: {
    async loadCartItems() {
      try {
        this.cartItems = await api_index.cartApi.getCartItems(this.userId);
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:107", this.cartItems);
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:108", "购物车数据:", this.cartItems);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:110", "加载购物车失败:", error);
        common_vendor.index.showToast({
          title: "加载购物车失败",
          icon: "none"
        });
      }
    },
    // 减少数量
    async decreaseQuantity(item) {
      if (item.quantity <= 1)
        return;
      try {
        await api_index.cartApi.saveCartItem({
          userId: this.userId,
          menuItemId: item.menuItemId,
          quantity: -1
        });
        await this.loadCartItems();
        await store_index.store.updateCartBadge();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:130", "减少数量失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    // 增加数量
    async increaseQuantity(item) {
      try {
        await api_index.cartApi.saveCartItem({
          userId: this.userId,
          menuItemId: item.menuItemId,
          quantity: 1
        });
        await this.loadCartItems();
        await store_index.store.updateCartBadge();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:149", "增加数量失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    // 删除商品
    async removeItem(item) {
      try {
        await api_index.cartApi.removeCartItem(this.userId, item.menuItemId);
        await this.loadCartItems();
        await store_index.store.updateCartBadge();
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:168", "删除失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    },
    // 跳转到菜单页
    navigateToMenu() {
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    },
    // 去结算
    async checkout() {
      if (this.cartItems.length === 0)
        return;
      try {
        const order = await api_index.orderApi.createOrder(this.userId);
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:188", order);
        common_vendor.index.navigateTo({
          url: `/pages/checkout/checkout?orderId=${order.id}`
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:193", "创建订单失败:", error);
        common_vendor.index.showToast({
          title: "创建订单失败",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cartItems.length === 0
  }, $data.cartItems.length === 0 ? {
    b: common_vendor.p({
      type: "cart",
      size: "64",
      color: "#999"
    }),
    c: common_vendor.o((...args) => $options.navigateToMenu && $options.navigateToMenu(...args))
  } : {
    d: common_vendor.f($data.cartItems, (item, k0, i0) => {
      return {
        a: item.itemImageUrl,
        b: common_vendor.t(item.itemName),
        c: common_vendor.t(item.itemPrice),
        d: common_vendor.o(($event) => $options.decreaseQuantity(item), item.id),
        e: "c91e7611-1-" + i0,
        f: common_vendor.p({
          type: "minus",
          size: "20",
          color: item.quantity <= 1 ? "#ccc" : "#007AFF"
        }),
        g: common_vendor.t(item.quantity),
        h: common_vendor.o(($event) => $options.increaseQuantity(item), item.id),
        i: "c91e7611-2-" + i0,
        j: common_vendor.o(($event) => $options.removeItem(item), item.id),
        k: "c91e7611-3-" + i0,
        l: item.id
      };
    }),
    e: common_vendor.p({
      type: "plus",
      size: "20",
      color: "#007AFF"
    }),
    f: common_vendor.p({
      type: "trash",
      size: "24",
      color: "#ff5a5f"
    }),
    g: common_vendor.t($options.totalAmount),
    h: $data.cartItems.length === 0,
    i: common_vendor.o((...args) => $options.checkout && $options.checkout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c91e7611"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/cart.js.map
