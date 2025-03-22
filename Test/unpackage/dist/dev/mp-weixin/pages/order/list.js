"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
const _sfc_main = {
  setup() {
    const statusTabs = common_vendor.reactive([
      { name: "全部", value: "all" },
      { name: "待付款", value: "pending" },
      { name: "已付款", value: "paid" },
      { name: "已完成", value: "completed" }
    ]);
    const currentStatus = common_vendor.ref("all");
    const orderList = common_vendor.ref([]);
    const isRefreshing = common_vendor.ref(false);
    const loadMoreStatus = common_vendor.ref("more");
    const page = common_vendor.ref(0);
    const pageSize = 10;
    const hasMore = common_vendor.ref(true);
    const checkLogin = () => {
      const userId = store_index.store.getUserId();
      if (!userId) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后查看订单",
          confirmText: "去登录",
          cancelText: "返回",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.switchTab({
                url: "/pages/user/user"
              });
            } else {
              common_vendor.index.navigateBack();
            }
          }
        });
        return false;
      }
      return true;
    };
    const loadOrders = async (reset = false) => {
      if (!checkLogin())
        return;
      try {
        if (reset) {
          page.value = 0;
          orderList.value = [];
        }
        if (!hasMore.value && !reset)
          return;
        loadMoreStatus.value = "loading";
        const res = await api_index.orderApi.getUserOrders({
          userId: store_index.store.getUserId(),
          page: page.value,
          size: pageSize,
          status: currentStatus.value
        });
        if (res && res.content) {
          if (reset) {
            orderList.value = res.content;
          } else {
            orderList.value = [...orderList.value, ...res.content];
          }
          hasMore.value = !res.last;
          loadMoreStatus.value = hasMore.value ? "more" : "noMore";
          if (hasMore.value) {
            page.value++;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/list.vue:182", "加载订单失败:", error);
        loadMoreStatus.value = "more";
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    };
    const onRefresh = async () => {
      if (!checkLogin()) {
        isRefreshing.value = false;
        return;
      }
      isRefreshing.value = true;
      await loadOrders(true);
      isRefreshing.value = false;
    };
    const loadMore = () => {
      if (loadMoreStatus.value === "loading" || !hasMore.value)
        return;
      loadOrders();
    };
    const switchStatus = (status) => {
      if (!checkLogin())
        return;
      currentStatus.value = status;
      loadOrders(true);
    };
    common_vendor.onMounted(() => {
      if (!checkLogin())
        return;
      loadOrders();
    });
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const getStatusText = (status) => {
      const statusMap = {
        PENDING: "待付款",
        PROCESSING: "进行中",
        COMPLETED: "已完成",
        CANCELLED: "已取消"
      };
      return statusMap[status] || status;
    };
    const getStatusColor = (status) => {
      const colorMap = {
        pending: "#ff9800",
        processing: "#007AFF",
        completed: "#52c41a"
      };
      return colorMap[status] || "#999";
    };
    const getTotalQuantity = (items) => {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    };
    const payOrder = (order) => {
      if (!checkLogin())
        return;
      common_vendor.index.navigateTo({
        url: `/pages/checkout/checkout?orderId=${order.id}&orderNumber=${order.orderNumber}&amount=${order.totalAmount}`
      });
    };
    const cancelOrder = async (order) => {
      try {
        await api_index.orderApi.cancelOrder(order.id);
        common_vendor.index.showToast({
          title: "订单已取消",
          icon: "success"
        });
        loadOrders();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/list.vue:280", "取消订单失败:", error);
        common_vendor.index.showToast({
          title: "取消失败",
          icon: "none"
        });
      }
    };
    const buyAgain = async (order) => {
      try {
        for (const item of order.orderItems) {
          await cartApi.saveCartItem({
            userId: store_index.store.getUserId(),
            menuItemId: item.id,
            quantity: item.quantity
          });
        }
        common_vendor.index.showToast({
          title: "已添加到购物车",
          icon: "success"
        });
        common_vendor.index.switchTab({
          url: "/pages/cart/cart"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/list.vue:307", "添加到购物车失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const deleteOrder = (order) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_index.orderApi.deleteOrder(order.id);
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              onRefresh();
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/order/list.vue:330", "删除订单失败:", error);
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const goToOrderDetail = (orderId) => {
      if (!checkLogin())
        return;
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    };
    return {
      statusTabs,
      currentStatus,
      orderList,
      isRefreshing,
      loadMoreStatus,
      switchStatus,
      onRefresh,
      loadMore,
      formatTime,
      getStatusText,
      getStatusColor,
      getTotalQuantity,
      payOrder,
      cancelOrder,
      buyAgain,
      deleteOrder,
      loadOrders,
      goToOrderDetail
      // 添加到返回对象中
    };
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($setup.statusTabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: tab.value,
        c: $setup.currentStatus === tab.value ? 1 : "",
        d: common_vendor.o(($event) => $setup.switchStatus(tab.value), tab.value)
      };
    }),
    b: $setup.orderList.length > 0
  }, $setup.orderList.length > 0 ? {
    c: common_vendor.f($setup.orderList, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNumber),
        b: common_vendor.t($setup.getStatusText(order.status)),
        c: common_vendor.f(order.orderItems, (item, k1, i1) => {
          return {
            a: common_vendor.t(item.itemName),
            b: common_vendor.t(item.quantity),
            c: common_vendor.t(item.price.toFixed(2)),
            d: item.id
          };
        }),
        d: common_vendor.t($setup.formatTime(order.createTime)),
        e: common_vendor.t(order.totalAmount.toFixed(2)),
        f: order.status === "PENDING"
      }, order.status === "PENDING" ? {
        g: common_vendor.o(($event) => $setup.payOrder(order), order.id),
        h: common_vendor.o(($event) => $setup.cancelOrder(order), order.id)
      } : order.status === "COMPLETED" ? {
        j: common_vendor.o(($event) => $setup.deleteOrder(order), order.id),
        k: common_vendor.o(($event) => $setup.buyAgain(order), order.id)
      } : order.status === "PAID" ? {} : {}, {
        i: order.status === "COMPLETED",
        l: order.status === "PAID",
        m: order.id
      });
    })
  } : {
    d: common_vendor.p({
      type: "shop",
      size: "50",
      color: "#999"
    })
  }, {
    e: common_vendor.p({
      status: $setup.loadMoreStatus
    }),
    f: $setup.isRefreshing,
    g: common_vendor.o((...args) => $setup.onRefresh && $setup.onRefresh(...args)),
    h: common_vendor.o((...args) => $setup.loadMore && $setup.loadMore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-456ecf67"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map
