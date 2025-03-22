"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
const _sfc_main = {
  setup() {
    const isLoggedIn = common_vendor.ref(false);
    const userInfo = common_vendor.reactive({
      id: "",
      openId: "",
      nickname: "",
      avatarUrl: "",
      gender: 0
    });
    const orderStats = common_vendor.ref([
      { label: "全部订单", count: 0, status: "all" },
      { label: "待付款", count: 0, status: "pending" },
      { label: "进行中", count: 0, status: "processing" },
      { label: "已完成", count: 0, status: "completed" }
    ]);
    const menuItems = common_vendor.ref([
      {
        id: 1,
        name: "我的订单",
        icon: "list",
        color: "#007AFF",
        path: "/pages/order/list"
      },
      {
        id: 2,
        name: "优惠券",
        icon: "ticket",
        color: "#51cf66",
        badge: "2",
        badgeType: "error",
        path: "/pages/coupon/list"
      },
      {
        id: 3,
        name: "联系客服",
        icon: "headphones",
        color: "#fcc419",
        path: "/pages/service/contact"
      },
      {
        id: 4,
        name: "设置",
        icon: "gear",
        color: "#666",
        path: "/pages/settings/index"
      }
    ]);
    const logoutPopupRef = common_vendor.ref(null);
    const onGetUserInfo = async (e) => {
      try {
        if (e.detail.errMsg !== "getUserInfo:ok") {
          throw new Error("用户拒绝授权");
        }
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: (res2) => resolve(res2),
            fail: (err) => reject(err)
          });
        });
        const res = await api_index.userApi.wxLogin({
          code: loginRes.code,
          userInfo: e.detail.userInfo
        });
        Object.assign(userInfo, {
          ...res.user,
          nickName: e.detail.userInfo.nickName,
          avatarUrl: e.detail.userInfo.avatarUrl,
          gender: e.detail.userInfo.gender
        });
        store_index.store.login(userInfo, res.token);
        isLoggedIn.value = true;
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        common_vendor.index.__f__("log", "at pages/user/user.vue:183", res);
        common_vendor.index.__f__("log", "at pages/user/user.vue:184", userInfo);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:186", "登录失败:", error);
        if (error.message === "用户拒绝授权") {
          common_vendor.index.showModal({
            title: "提示",
            content: "需要您的授权才能继续使用",
            showCancel: false
          });
        } else {
          common_vendor.index.showToast({
            title: error.message || "登录失败",
            icon: "none"
          });
        }
      }
    };
    const confirmLogout = () => {
      store_index.store.logout();
      isLoggedIn.value = false;
      common_vendor.index.showToast({
        title: "已退出登录",
        icon: "success"
      });
      logoutPopupRef.value.close();
    };
    const closeLogout = () => {
      logoutPopupRef.value.close();
    };
    const handleLogout = () => {
      logoutPopupRef.value.open();
    };
    const goToSettings = () => {
      common_vendor.index.navigateTo({
        url: "/pages/settings/index"
      });
    };
    const goToOrders = (status) => {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              handleLogin();
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/list?status=${status}`
      });
    };
    const handleMenuClick = (item) => {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              handleLogin();
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: item.path
      });
    };
    return {
      isLoggedIn,
      userInfo,
      orderStats,
      menuItems,
      handleLogout,
      goToSettings,
      goToOrders,
      handleMenuClick,
      onGetUserInfo,
      logoutPopupRef,
      confirmLogout,
      closeLogout
    };
  },
  onShow() {
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_grid_item2 = common_vendor.resolveComponent("uni-grid-item");
  const _easycom_uni_grid2 = common_vendor.resolveComponent("uni-grid");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_badge2 = common_vendor.resolveComponent("uni-badge");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_card2 + _easycom_uni_grid_item2 + _easycom_uni_grid2 + _easycom_uni_section2 + _easycom_uni_badge2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_grid_item = () => "../../uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.js";
const _easycom_uni_grid = () => "../../uni_modules/uni-grid/components/uni-grid/uni-grid.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_badge = () => "../../uni_modules/uni-badge/components/uni-badge/uni-badge.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_card + _easycom_uni_grid_item + _easycom_uni_grid + _easycom_uni_section + _easycom_uni_badge + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$setup.isLoggedIn
  }, !$setup.isLoggedIn ? {
    b: common_vendor.p({
      type: "person",
      size: "50",
      color: "#999"
    }),
    c: common_vendor.o((...args) => _ctx.handleLogin && _ctx.handleLogin(...args)),
    d: common_vendor.o((...args) => $setup.onGetUserInfo && $setup.onGetUserInfo(...args))
  } : {
    e: $setup.userInfo.avatarUrl,
    f: common_vendor.t($setup.userInfo.nickname),
    g: common_vendor.t($setup.userInfo.id)
  }, {
    h: common_vendor.o($setup.goToSettings),
    i: common_vendor.p({
      type: "gear",
      size: "24",
      color: "#666"
    }),
    j: common_vendor.f($setup.orderStats, (stat, index, i0) => {
      return {
        a: common_vendor.t(stat.count),
        b: common_vendor.t(stat.label),
        c: index,
        d: common_vendor.o(($event) => $setup.goToOrders(stat.status), index),
        e: "0f7520f0-5-" + i0 + ",0f7520f0-4"
      };
    }),
    k: common_vendor.p({
      column: 4,
      highlight: false,
      showBorder: false
    }),
    l: common_vendor.p({
      title: "我的订单",
      type: "line"
    }),
    m: common_vendor.f($setup.menuItems, (item, k0, i0) => {
      return common_vendor.e({
        a: "0f7520f0-7-" + i0 + ",0f7520f0-6",
        b: common_vendor.p({
          ["custom-prefix"]: "custom-icon",
          type: item.icon,
          size: "28",
          color: item.color
        }),
        c: common_vendor.t(item.name),
        d: item.badge
      }, item.badge ? {
        e: "0f7520f0-8-" + i0 + ",0f7520f0-6",
        f: common_vendor.p({
          text: item.badge,
          type: item.badgeType || "error",
          absolute: "rightTop"
        })
      } : {}, {
        g: item.id,
        h: common_vendor.o(($event) => $setup.handleMenuClick(item), item.id)
      });
    }),
    n: common_vendor.p({
      title: "我的服务",
      type: "line"
    }),
    o: common_vendor.o($setup.confirmLogout),
    p: common_vendor.o($setup.closeLogout),
    q: common_vendor.p({
      type: "warning",
      title: "提示",
      content: "确定要退出登录吗？",
      duration: 2e3,
      ["before-close"]: true
    }),
    r: common_vendor.sr("logoutPopupRef", "0f7520f0-9"),
    s: common_vendor.p({
      type: "dialog"
    }),
    t: $setup.isLoggedIn
  }, $setup.isLoggedIn ? {
    v: common_vendor.p({
      type: "poweroff",
      size: "16",
      color: "#ff5a5f"
    }),
    w: common_vendor.o((...args) => $setup.handleLogout && $setup.handleLogout(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
