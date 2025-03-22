"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
const _sfc_main = {
  data() {
    return {
      order: null,
      orderItems: [],
      loading: false,
      isPaying: false,
      userId: ""
    };
  },
  onLoad(options) {
    this.userId = store_index.store.getUserId();
    const orderId = options.orderId;
    common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:48", orderId);
    if (orderId) {
      this.loadOrderById(orderId);
    } else {
      this.loadLatestOrder();
    }
  },
  methods: {
    // 根据ID加载订单
    async loadOrderById(orderId) {
      try {
        this.loading = true;
        const order = await api_index.orderApi.getOrderDetails(orderId);
        this.order = order;
        this.orderItems = order.orderItems || [];
        common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:64", this.order);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:66", "加载订单详情失败:", error);
        common_vendor.index.showToast({
          title: "加载订单失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 加载最新订单
    async loadLatestOrder() {
      try {
        this.loading = true;
        const userId = store_index.store.getUserId();
        const orders = await api_index.orderApi.getUserOrders(userId, 0, 1);
        if (orders && orders.content && orders.content.length > 0) {
          const latestOrder = orders.content[0];
          await this.loadOrderById(latestOrder.id);
        } else {
          common_vendor.index.showToast({
            title: "没有找到订单",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:95", "加载最新订单失败:", error);
        common_vendor.index.showToast({
          title: "加载订单失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    async handlePay() {
      if (this.isPaying)
        return;
      this.isPaying = true;
      try {
        const payParams = await api_index.orderApi.getWxPayParams(this.order.id);
        await new Promise((resolve, reject) => {
          common_vendor.index.requestPayment({
            ...payParams,
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        await api_index.orderApi.payOrder(this.order.id);
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success"
        });
        await cartApi.clearCart(this.userId);
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/menu/menu"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:144", "支付失败:", error);
        common_vendor.index.showToast({
          title: error.message || "支付失败",
          icon: "none"
        });
      } finally {
        this.isPaying = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orderItems, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.itemName),
        b: common_vendor.t(item.quantity),
        c: common_vendor.t((item.price * item.quantity).toFixed(2)),
        d: item.id
      };
    }),
    b: common_vendor.t($data.order.totalAmount.toFixed(2)),
    c: common_vendor.t($data.isPaying ? "支付中..." : "立即支付"),
    d: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args)),
    e: $data.isPaying
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fd186f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map
