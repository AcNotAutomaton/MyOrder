"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const menuItem = common_vendor.ref({});
    const quantity = common_vendor.ref(1);
    const keyword = common_vendor.ref("");
    const searchResults = common_vendor.ref([]);
    const isSearchMode = common_vendor.computed(() => !!keyword.value);
    const handleAddToCart = async () => {
      try {
        const userId = store_index.store.getUserId();
        if (!userId) {
          common_vendor.index.showModal({
            title: "提示",
            content: "请先登录后再操作",
            confirmText: "去登录",
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.switchTab({ url: "/pages/user/user" });
              }
            }
          });
          return;
        }
        await api_index.cartApi.saveCartItem({
          userId,
          menuItemId: menuItem.value.id,
          quantity: quantity.value
        });
        common_vendor.index.showToast({
          title: "已加入购物车",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/menu/detail.vue:129", "添加到购物车失败:", error);
        common_vendor.index.showToast({
          title: "添加失败",
          icon: "none"
        });
      }
    };
    const loadMenuItemDetail = async (id) => {
      try {
        if (!id)
          return;
        common_vendor.index.__f__("log", "at pages/menu/detail.vue:141", "加载菜品详情, id:", id);
        const res = await api_index.menuApi.getMenuItem(id);
        menuItem.value = res;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/menu/detail.vue:145", "获取菜品详情失败:", error);
        common_vendor.index.showToast({
          title: "获取菜品详情失败",
          icon: "none"
        });
      }
    };
    const searchMenuItems = async () => {
      try {
        if (!keyword.value)
          return;
        common_vendor.index.__f__("log", "at pages/menu/detail.vue:157", "搜索关键词:", keyword.value);
        const res = await api_index.menuApi.searchMenuItems(keyword.value);
        searchResults.value = res || [];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/menu/detail.vue:161", "搜索失败:", error);
        common_vendor.index.showToast({
          title: "搜索失败",
          icon: "none"
        });
        searchResults.value = [];
      }
    };
    const increaseQuantity = () => {
      quantity.value++;
    };
    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };
    const showDetail = (id) => {
      common_vendor.index.redirectTo({
        url: `/pages/menu/detail?id=${id}`
      });
    };
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = ((_a = currentPage.$page) == null ? void 0 : _a.options) || currentPage.options || {};
      common_vendor.index.__f__("log", "at pages/menu/detail.vue:196", "页面参数:", options);
      const { id, keyword: searchKeyword } = options;
      if (id) {
        loadMenuItemDetail(id);
      } else if (searchKeyword) {
        keyword.value = decodeURIComponent(searchKeyword);
        searchMenuItems();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isSearchMode.value
      }, isSearchMode.value ? {
        b: common_vendor.t(keyword.value),
        c: common_vendor.t(searchResults.value.length),
        d: common_vendor.f(searchResults.value, (item, k0, i0) => {
          return {
            a: item.imageUrl,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.description),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.salesCount),
            f: item.id,
            g: common_vendor.o(($event) => showDetail(item.id), item.id)
          };
        })
      } : common_vendor.e({
        e: menuItem.value.imageUrl,
        f: common_vendor.t(menuItem.value.name),
        g: common_vendor.t(menuItem.value.price),
        h: common_vendor.t(menuItem.value.salesCount),
        i: menuItem.value.isRecommend
      }, menuItem.value.isRecommend ? {} : {}, {
        j: common_vendor.t(menuItem.value.description),
        k: common_vendor.o(decreaseQuantity),
        l: quantity.value <= 1 ? 1 : "",
        m: common_vendor.p({
          type: "minus",
          size: "20",
          color: "#999"
        }),
        n: common_vendor.t(quantity.value),
        o: common_vendor.o(increaseQuantity),
        p: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#007AFF"
        }),
        q: common_vendor.o(handleAddToCart)
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-846d6fa8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/detail.js.map
