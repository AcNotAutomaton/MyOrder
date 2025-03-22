"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const store_index = require("../../store/index.js");
const _sfc_main = {
  data() {
    return {
      searchKeyword: "",
      currentCategoryId: store_index.store.getCurrentCategoryId(),
      categories: [],
      menuItems: [],
      isRefreshing: false,
      loadMoreStatus: "more",
      page: 1,
      loading: false
    };
  },
  async onShow() {
    await this.loadCategories();
    await this.loadMenuItems();
    common_vendor.index.__f__("log", "at pages/menu/menu.vue:139", "当前分类ID:", this.currentCategoryId);
    const ctgId = store_index.store.getCurrentCategoryId();
    if (ctgId !== null) {
      await this.selectCategory(ctgId);
    } else {
      await this.selectCategory(this.categories[0].id);
    }
  },
  methods: {
    // 处理搜索
    async handleSearch(e) {
      if (!this.searchKeyword.trim()) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/menu/detail?keyword=${encodeURIComponent(
          this.searchKeyword.trim()
        )}`
      });
    },
    // 加载分类
    async loadCategories() {
      try {
        const categories = await api_index.categoryApi.getAllCategories();
        this.categories = categories;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:174", "加载分类失败:", error);
        common_vendor.index.showToast({
          title: "加载分类失败",
          icon: "none"
        });
      }
    },
    // 选择分类
    async selectCategory(categoryId) {
      try {
        if (!categoryId) {
          common_vendor.index.__f__("warn", "at pages/menu/menu.vue:186", "selectCategory: categoryId is missing.");
          return;
        }
        if (this.currentCategoryId === categoryId) {
          common_vendor.index.__f__("log", "at pages/menu/menu.vue:190", "选中的分类相同，刷新菜单:", categoryId);
          await this.loadMenuItems();
          return;
        }
        this.currentCategoryId = categoryId;
        store_index.store.setCurrentCategoryId(categoryId);
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:197", "切换到新分类:", categoryId);
        await this.loadMenuItems();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:200", "selectCategory encountered an error:", error);
      }
    },
    // 加载菜品
    async loadMenuItems() {
      try {
        this.loading = true;
        const currentId = store_index.store.getCurrentCategoryId();
        if (currentId === null) {
          await this.selectCategory(this.categories[0].id);
        }
        const res = await api_index.menuApi.getMenuItemsByCategory(
          this.currentCategoryId
        );
        this.menuItems = res;
      } catch (error) {
        if (error.errMsg !== "request:fail abort") {
          common_vendor.index.__f__("error", "at pages/menu/menu.vue:218", "加载菜品失败:", error);
          common_vendor.index.showToast({
            title: "加载菜品失败",
            icon: "none"
          });
        }
      } finally {
        this.loading = false;
      }
    },
    // 下拉刷新
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadCategories();
      await this.loadMenuItems();
      this.isRefreshing = false;
      common_vendor.index.stopPullDownRefresh();
    },
    // 添加到购物车
    async addToCart(item) {
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
        await store_index.store.updateCartBadge();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:270", "添加到购物车失败:", error);
        common_vendor.index.showToast({
          title: "添加失败",
          icon: "none"
        });
      }
    },
    handleImageError(e) {
      common_vendor.index.__f__("error", "at pages/menu/menu.vue:279", "图片加载失败:", e);
      e.target.src = "/static/default-food.png";
    },
    async updateCartCount() {
      const userId = this.$store.getUserId();
      if (userId) {
        try {
          const response = await api_index.cartApi.getCartItems(userId);
          this.cartItemCount = response.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/menu/menu.vue:293", "获取购物车失败:", error);
        }
      }
    },
    // 跳转到详情页
    navigateToDetail(item) {
      common_vendor.index.navigateTo({
        url: `/pages/menu/detail?id=${item.id}`
      });
    },
    loadMore() {
      if (this.loadMoreStatus === "noMore")
        return;
      this.loadMoreStatus = "loading";
      setTimeout(() => {
        this.loadMoreStatus = "noMore";
      }, 1e3);
    },
    refreshList() {
      this.page = 1;
    },
    // 热门搜索标签
    hotSearchTags: common_vendor.ref(["热销套餐", "今日特价", "新品上市", "店长推荐"]),
    // 快速搜索
    quickSearch(keyword) {
      this.searchKeyword = keyword;
      this.handleSearch();
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_search_bar2 + _easycom_uni_tag2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_search_bar + _easycom_uni_tag + _easycom_uni_load_more)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      color: "#666",
      size: "18",
      type: "search"
    }),
    b: common_vendor.o($options.handleSearch),
    c: common_vendor.o(($event) => $data.searchKeyword = $event),
    d: common_vendor.p({
      radius: "100",
      placeholder: "探索美食...",
      bgColor: "#f5f6f7",
      cancelButton: "none",
      modelValue: $data.searchKeyword
    }),
    e: common_vendor.f($options.hotSearchTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index,
        c: common_vendor.o(($event) => $options.quickSearch(tag), index)
      };
    }),
    f: common_vendor.f($data.categories, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: $data.currentCategoryId === item.id
      }, $data.currentCategoryId === item.id ? {} : {}, {
        c: item.id,
        d: $data.currentCategoryId === item.id ? 1 : "",
        e: common_vendor.o(($event) => $options.selectCategory(item.id), item.id)
      });
    }),
    g: common_vendor.f($data.menuItems, (item, index, i0) => {
      return common_vendor.e({
        a: item.imageUrl || "/static/default-food.png",
        b: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args), item.id),
        c: item.isRecommend
      }, item.isRecommend ? {
        d: "388b40d3-2-" + i0,
        e: common_vendor.p({
          text: "推荐",
          type: "warning",
          size: "small",
          customStyle: "background: linear-gradient(135deg, #ff6b6b, #ff8787)"
        })
      } : {}, {
        f: common_vendor.t(item.name),
        g: common_vendor.t(item.description),
        h: common_vendor.t(item.price),
        i: common_vendor.t(item.salesCount),
        j: "388b40d3-3-" + i0,
        k: common_vendor.o(($event) => $options.addToCart(item), item.id),
        l: item.id,
        m: index * 0.05 + "s",
        n: common_vendor.o(($event) => $options.navigateToDetail(item), item.id)
      });
    }),
    h: common_vendor.p({
      type: "plus",
      size: "24",
      color: "#fff"
    }),
    i: common_vendor.p({
      status: $data.loadMoreStatus,
      iconType: "circle"
    }),
    j: $data.isRefreshing,
    k: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    l: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-388b40d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/menu.js.map
