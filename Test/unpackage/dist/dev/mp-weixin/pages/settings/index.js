"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  setup() {
    const cacheSize = common_vendor.ref("0.0MB");
    const notificationEnabled = common_vendor.ref(true);
    const version = common_vendor.ref("1.0.0");
    const clearCache = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清除缓存吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "清理中..." });
            setTimeout(() => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "清除成功",
                icon: "success"
              });
              cacheSize.value = "0.0MB";
            }, 1e3);
          }
        }
      });
    };
    const toggleNotification = (e) => {
      notificationEnabled.value = e.detail.value;
    };
    const checkUpdate = () => {
      common_vendor.index.showLoading({ title: "检查中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "已是最新版本",
          icon: "none"
        });
      }, 1e3);
    };
    const showPrivacy = () => {
      common_vendor.index.navigateTo({
        url: "/pages/webview/privacy"
      });
    };
    const showAgreement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/webview/agreement"
      });
    };
    return {
      cacheSize,
      notificationEnabled,
      version,
      clearCache,
      toggleNotification,
      checkUpdate,
      showPrivacy,
      showAgreement
    };
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
  return {
    a: common_vendor.t($setup.cacheSize),
    b: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    c: common_vendor.o((...args) => $setup.clearCache && $setup.clearCache(...args)),
    d: $setup.notificationEnabled,
    e: common_vendor.o((...args) => $setup.toggleNotification && $setup.toggleNotification(...args)),
    f: common_vendor.t($setup.version),
    g: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    h: common_vendor.o((...args) => $setup.checkUpdate && $setup.checkUpdate(...args)),
    i: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    j: common_vendor.o((...args) => $setup.showPrivacy && $setup.showPrivacy(...args)),
    k: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    l: common_vendor.o((...args) => $setup.showAgreement && $setup.showAgreement(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a11b3e9a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/index.js.map
