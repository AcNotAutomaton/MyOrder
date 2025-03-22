"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_grid_item2 = common_vendor.resolveComponent("uni-grid-item");
  const _easycom_uni_grid2 = common_vendor.resolveComponent("uni-grid");
  const _easycom_uni_badge2 = common_vendor.resolveComponent("uni-badge");
  (_easycom_uni_icons2 + _easycom_uni_search_bar2 + _easycom_uni_grid_item2 + _easycom_uni_grid2 + _easycom_uni_badge2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_grid_item = () => "../../uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.js";
const _easycom_uni_grid = () => "../../uni_modules/uni-grid/components/uni-grid/uni-grid.js";
const _easycom_uni_badge = () => "../../uni_modules/uni-badge/components/uni-badge/uni-badge.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_search_bar + _easycom_uni_grid_item + _easycom_uni_grid + _easycom_uni_badge)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const swiperCurrent = common_vendor.ref(0);
    const banners = common_vendor.ref([
      { imageUrl: "/static/banner1.jpg" },
      { imageUrl: "/static/banner2.jpg" },
      { imageUrl: "/static/banner3.jpg" }
    ]);
    const categories = common_vendor.ref([
      { id: 1, name: "热菜", icon: "/static/icons/hot.png" },
      { id: 2, name: "凉菜", icon: "/static/icons/cold.png" },
      { id: 3, name: "主食", icon: "/static/icons/staple.png" },
      { id: 4, name: "汤类", icon: "/static/icons/drink.png" }
    ]);
    const recommendItems = common_vendor.ref([]);
    const hotItems = common_vendor.ref([]);
    const hotSearchTags = common_vendor.ref([
      "红烧肉",
      "宫保鸡丁",
      "水煮鱼",
      "麻婆豆腐",
      "炒青菜"
    ]);
    const swiperChange = (e) => {
      swiperCurrent.value = e.detail.current;
    };
    const getBadgeClass = (index) => {
      const classes = ["rank-1", "rank-2", "rank-3"];
      return index < 3 ? classes[index] : "";
    };
    const loadRecommendItems = async () => {
      try {
        const res = await api_index.menuApi.getRecommendItems();
        recommendItems.value = res.data;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:179", "推荐菜品加载失败:", error);
        common_vendor.index.showToast({
          title: "加载推荐菜品失败",
          icon: "none"
        });
      }
    };
    const loadHotItems = async () => {
      try {
        const res = await api_index.menuApi.getHotItems(0, 10);
        hotItems.value = res.data || [];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:192", "热销菜品加载失败:", error);
        common_vendor.index.showToast({
          title: "加载热销菜品失败",
          icon: "none"
        });
        hotItems.value = [];
      }
    };
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/menu/detail?keyword=${encodeURIComponent(
          searchKeyword.value
        )}`
      });
    };
    const handleCategoryClick = (category) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:217", "点击分类:", category);
      store_index.store.setCurrentCategoryId(category.id);
      common_vendor.index.__f__("log", "at pages/index/index.vue:219", "当前分类ID:", store_index.store.getCurrentCategoryId());
      common_vendor.index.switchTab({
        url: `/pages/menu/menu`
      });
    };
    const navigateToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/menu/detail?id=${item.id}`
      });
    };
    const navigateToMenu = () => {
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    };
    const addToCart = async (item) => {
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
          menuItemId: item.id,
          quantity: 1
        });
        common_vendor.index.showToast({
          title: "已加入购物车",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:265", "添加失败:", error);
        common_vendor.index.showToast({
          title: "添加失败",
          icon: "none"
        });
      }
    };
    const handleTagClick = (tag) => {
      searchKeyword.value = tag;
      handleSearch();
    };
    common_vendor.onMounted(() => {
      loadRecommendItems();
      loadHotItems();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          color: "#666",
          size: "18",
          type: "search"
        }),
        b: common_vendor.o(handleSearch),
        c: common_vendor.o(($event) => searchKeyword.value = $event),
        d: common_vendor.p({
          radius: 100,
          placeholder: "搜索你喜欢的美食",
          bgColor: "#ffffff",
          focus: false,
          modelValue: searchKeyword.value
        }),
        e: common_vendor.f(banners.value, (item, index, i0) => {
          return {
            a: item.imageUrl,
            b: index
          };
        }),
        f: common_vendor.o(swiperChange),
        g: common_vendor.f(banners.value, (item, index, i0) => {
          return {
            a: index,
            b: swiperCurrent.value === index ? 1 : ""
          };
        }),
        h: common_vendor.f(categories.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.o(($event) => handleCategoryClick(item), item.id),
            d: item.id,
            e: "1cf27b2a-3-" + i0 + ",1cf27b2a-2"
          };
        }),
        i: common_vendor.p({
          column: 4,
          highlight: false,
          showBorder: false
        }),
        j: common_vendor.p({
          type: "right",
          size: "14",
          color: "#666"
        }),
        k: common_vendor.o(navigateToMenu),
        l: common_vendor.f(recommendItems.value, (item, k0, i0) => {
          return {
            a: item.imageUrl,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.description),
            d: common_vendor.t(item.price),
            e: "1cf27b2a-5-" + i0,
            f: common_vendor.o(($event) => addToCart(item), item.id),
            g: item.id,
            h: common_vendor.o(($event) => navigateToDetail(item), item.id)
          };
        }),
        m: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#ffffff"
        }),
        n: common_vendor.p({
          text: hotItems.value.length,
          type: "primary",
          size: "small"
        }),
        o: common_vendor.f(hotItems.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.n(getBadgeClass(index)),
            c: item.imageUrl,
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.description),
            f: common_vendor.t(item.price),
            g: "1cf27b2a-7-" + i0,
            h: common_vendor.o(($event) => addToCart(item), item.id),
            i: item.id,
            j: common_vendor.o(($event) => navigateToDetail(item), item.id)
          };
        }),
        p: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#ffffff"
        }),
        q: hotSearchTags.value.length
      }, hotSearchTags.value.length ? {
        r: common_vendor.f(hotSearchTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index,
            c: common_vendor.o(($event) => handleTagClick(tag), index)
          };
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
