<template>
  <view class="menu-container">
    <!-- 顶部搜索区 -->
    <view class="search-header">
      <view class="search-box">
        <uni-search-bar
          class="search-bar"
          radius="100"
          placeholder="探索美食..."
          v-model="searchKeyword"
          @confirm="handleSearch"
          bgColor="#f5f6f7"
          cancelButton="none"
        >
          <template v-slot:searchIcon>
            <uni-icons color="#666" size="18" type="search" />
          </template>
        </uni-search-bar>

        <!-- 热门搜索标签 -->
        <scroll-view scroll-x class="hot-search" :show-scrollbar="false">
          <view class="tag-list">
            <view
              class="search-tag"
              v-for="(tag, index) in hotSearchTags"
              :key="index"
              @tap="quickSearch(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 分类导航 -->
    <scroll-view
      scroll-x
      class="category-scroll"
      :show-scrollbar="false"
      enhanced
    >
      <view class="category-list">
        <view
          v-for="item in categories"
          :key="item.id"
          class="category-item"
          :class="{ active: currentCategoryId === item.id }"
          @tap="selectCategory(item.id)"
        >
          <text class="category-name">{{ item.name }}</text>
          <view class="active-line" v-if="currentCategoryId === item.id"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 菜品列表 -->
    <scroll-view
      scroll-y
      class="menu-scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
      enhanced
      :show-scrollbar="false"
    >
      <view class="menu-grid">
        <view
          class="menu-item"
          v-for="(item, index) in menuItems"
          :key="item.id"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @tap="navigateToDetail(item)"
        >
          <view class="item-content">
            <view class="image-wrapper">
              <image
                :src="item.imageUrl || '/static/default-food.png'"
                mode="aspectFill"
                class="food-img"
                @error="handleImageError"
              />
              <view class="tag-wrapper" v-if="item.isRecommend">
                <uni-tag
                  text="推荐"
                  type="warning"
                  size="small"
                  customStyle="background: linear-gradient(135deg, #ff6b6b, #ff8787)"
                />
              </view>
            </view>
            <view class="food-info">
              <text class="food-name">{{ item.name }}</text>
              <text class="food-desc">{{ item.description }}</text>
              <view class="bottom-info">
                <view class="price-box">
                  <text class="symbol">¥</text>
                  <text class="price">{{ item.price }}</text>
                  <text class="sales">已售 {{ item.salesCount }}</text>
                </view>
                <view class="add-btn" @tap.stop="addToCart(item)">
                  <uni-icons type="plus" size="24" color="#fff" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <uni-load-more :status="loadMoreStatus" iconType="circle" />
    </scroll-view>
  </view>
</template>

<script>
import { menuApi, cartApi, categoryApi } from "@/api";
import store from "@/store";
import { ref, onMounted } from "vue";

export default {
  data() {
    return {
      searchKeyword: "",
      currentCategoryId: store.getCurrentCategoryId(),
      categories: [],
      menuItems: [],
      isRefreshing: false,
      loadMoreStatus: "more",
      page: 1,
      loading: false,
    };
  },

  async onShow() {
    await this.loadCategories();
    await this.loadMenuItems();
    console.log("当前分类ID:", this.currentCategoryId);
    const ctgId = store.getCurrentCategoryId();
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
        uni.showToast({
          title: "请输入搜索关键词",
          icon: "none",
        });
        return;
      }

      // 跳转到详情页并传递搜索关键词
      uni.navigateTo({
        url: `/pages/menu/detail?keyword=${encodeURIComponent(
          this.searchKeyword.trim()
        )}`,
      });
    },

    // 加载分类
    async loadCategories() {
      try {
        const categories = await categoryApi.getAllCategories();
        this.categories = categories;
     
      } catch (error) {
        console.error("加载分类失败:", error);
        uni.showToast({
          title: "加载分类失败",
          icon: "none",
        });
      }
    },

    // 选择分类
    async selectCategory(categoryId) {
      try {
        if (!categoryId) {
          console.warn("selectCategory: categoryId is missing.");
          return;
        }
        if (this.currentCategoryId === categoryId) {
          console.log("选中的分类相同，刷新菜单:", categoryId);
          await this.loadMenuItems();
          return;
        }
        // 更新当前分类
        this.currentCategoryId = categoryId;
        store.setCurrentCategoryId(categoryId);
        console.log("切换到新分类:", categoryId);
        await this.loadMenuItems();
      } catch (error) {
        console.error("selectCategory encountered an error:", error);
      }
    },

    // 加载菜品
    async loadMenuItems() {
      try {
        this.loading = true;
        const currentId = store.getCurrentCategoryId();
        if (currentId === null) {
          await this.selectCategory(this.categories[0].id);
        }
        const res = await menuApi.getMenuItemsByCategory(
          this.currentCategoryId
        );
        this.menuItems = res;
      } catch (error) {
        if (error.errMsg !== "request:fail abort") {
          console.error("加载菜品失败:", error);
          uni.showToast({
            title: "加载菜品失败",
            icon: "none",
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
      uni.stopPullDownRefresh();
    },

    // 添加到购物车
    async addToCart(item) {
      try {
        const userId = store.getUserId();
        if (!userId) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再操作",
            confirmText: "去登录",
            success: (res) => {
              if (res.confirm) {
                uni.switchTab({ url: "/pages/user/user" });
              }
            },
          });
          return;
        }

        await cartApi.saveCartItem({
          userId,
          menuItemId: item.id,
          quantity: 1,
        });

        uni.showToast({
          title: "已加入购物车",
          icon: "success",
        });

        await store.updateCartBadge();
      } catch (error) {
        console.error("添加到购物车失败:", error);
        uni.showToast({
          title: "添加失败",
          icon: "none",
        });
      }
    },

    handleImageError(e) {
      console.error("图片加载失败:", e);
      e.target.src = "/static/default-food.png";
    },

    async updateCartCount() {
      const userId = this.$store.getUserId();
      if (userId) {
        try {
          const response = await cartApi.getCartItems(userId);
          this.cartItemCount = response.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
        } catch (error) {
          console.error("获取购物车失败:", error);
        }
      }
    },

    // 跳转到详情页
    navigateToDetail(item) {
      uni.navigateTo({
        url: `/pages/menu/detail?id=${item.id}`,
      });
    },

    loadMore() {
      if (this.loadMoreStatus === "noMore") return;
      this.loadMoreStatus = "loading";
      setTimeout(() => {
        // 模拟加载更多数据
        this.loadMoreStatus = "noMore";
      }, 1000);
    },

    refreshList() {
      this.page = 1;
      // 重新加载列表数据
    },

    // 热门搜索标签
    hotSearchTags: ref(["热销套餐", "今日特价", "新品上市", "店长推荐"]),

    // 快速搜索
    quickSearch(keyword) {
      this.searchKeyword = keyword;
      this.handleSearch();
    },
  },
};
</script>

<style lang="scss" scoped>
// 文本省略 mixin
@mixin text-ellipsis($lines) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: $lines;
    overflow: hidden;
  }
}

.menu-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

  .search-header {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 20rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .search-box {
      .search-bar {
        :deep(.uni-searchbar) {
          padding: 0;

          .uni-searchbar__box {
            justify-content: flex-start;
            padding: 0 30rpx;
            height: 72rpx;
            border-radius: 36rpx;
            background: #f5f6f7;

            .uni-searchbar__text-input {
              font-size: 28rpx;
              color: #333;
            }
          }
        }
      }

      .hot-search {
        margin-top: 20rpx;
        white-space: nowrap;

        .tag-list {
          display: inline-flex;
          padding: 0 10rpx;

          .search-tag {
            display: inline-block;
            padding: 8rpx 24rpx;
            margin-right: 16rpx;
            background: #f5f6f7;
            color: #666;
            font-size: 24rpx;
            border-radius: 28rpx;
            transition: all 0.3s;

            &:active {
              transform: scale(0.95);
              background: #e8e9eb;
            }
          }
        }
      }
    }
  }

  .category-scroll {
    background: #ffffff;
    padding: 20rpx 0;
    white-space: nowrap;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .category-list {
      padding: 0 20rpx;
      display: flex;

      .category-item {
        position: relative;
        padding: 16rpx 40rpx;
        margin-right: 20rpx;
        background: #f8f9fa;
        border-radius: 100rpx;
        transition: all 0.3s;
        cursor: pointer;

        &.active {
          background: linear-gradient(135deg, #007aff, #00b4ff);
          box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);

          .category-name {
            color: #fff;
          }

          .active-line {
            position: absolute;
            bottom: -4rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 20rpx;
            height: 4rpx;
            background: #fff;
            border-radius: 4rpx;
          }
        }

        .category-name {
          font-size: 28rpx;
          color: #666;
          font-weight: 500;
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  .menu-scroll {
    height: calc(100vh - 220rpx);

    .menu-grid {
      padding: 20rpx;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30rpx;

      .menu-item {
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30rpx);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .item-content {
          background: #ffffff;
          border-radius: 24rpx;
          overflow: hidden;
          box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
          transition: all 0.3s;

          &:active {
            transform: scale(0.98);
          }

          .image-wrapper {
            position: relative;

            .food-img {
              width: 100%;
              height: 300rpx;
              background: #f8f9fa;
            }

            .tag-wrapper {
              position: absolute;
              top: 16rpx;
              right: 16rpx;
            }
          }

          .food-info {
            padding: 20rpx;

            .food-name {
              font-size: 28rpx;
              font-weight: 600;
              color: #333;
              margin-bottom: 8rpx;
            }

            .food-desc {
              font-size: 24rpx;
              color: #999;
              line-height: 1.4;
              height: 68rpx;
              @include text-ellipsis(2);
            }

            .bottom-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 16rpx;

              .price-box {
                display: flex;
                align-items: baseline;

                .symbol {
                  font-size: 24rpx;
                  color: #ff6b6b;
                }

                .price {
                  font-size: 36rpx;
                  font-weight: bold;
                  color: #ff6b6b;
                  margin: 0 8rpx;
                }

                .sales {
                  font-size: 22rpx;
                  color: #999;
                }
              }

              .add-btn {
                width: 56rpx;
                height: 56rpx;
                background: linear-gradient(135deg, #007aff, #00b4ff);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
                transition: all 0.3s;

                &:active {
                  transform: scale(0.9);
                  box-shadow: 0 2rpx 6rpx rgba(0, 122, 255, 0.2);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
