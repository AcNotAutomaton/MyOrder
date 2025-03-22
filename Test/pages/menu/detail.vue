<template>
  <view class="detail-container">
    <!-- 如果是搜索模式，显示搜索结果列表 -->
    <template v-if="isSearchMode">
      <view class="search-result">
        <view class="result-header">
          <text class="result-title">搜索"{{ keyword }}"</text>
          <text class="result-count"
            >找到 {{ searchResults.length }} 个结果</text
          >
        </view>

        <view class="result-list">
          <view
            class="result-item"
            v-for="item in searchResults"
            :key="item.id"
            @tap="showDetail(item.id)"
          >
            <image :src="item.imageUrl" mode="aspectFill" class="item-image" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-desc">{{ item.description }}</text>
              <view class="item-bottom">
                <text class="item-price">¥{{ item.price }}</text>
                <text class="sales-count">月售 {{ item.salesCount }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 如果是详情模式，显示原有的详情内容 -->
    <template v-else>
      <!-- 菜品图片 -->
      <image :src="menuItem.imageUrl" mode="aspectFill" class="food-image" />

      <!-- 菜品信息 -->
      <view class="food-info">
        <view class="basic-info">
          <text class="food-name">{{ menuItem.name }}</text>
          <text class="food-price">¥{{ menuItem.price }}</text>
        </view>

        <view class="sales-info">
          <text class="sales-count">月售 {{ menuItem.salesCount }}</text>
          <text class="recommend-tag" v-if="menuItem.isRecommend"
            >店长推荐</text
          >
        </view>

        <view class="description">
          <text class="desc-title">菜品描述</text>
          <text class="desc-content">{{ menuItem.description }}</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-bar">
        <view class="quantity-control">
          <uni-icons
            type="minus"
            size="20"
            color="#999"
            @click="decreaseQuantity"
            :class="{ disabled: quantity <= 1 }"
          />
          <text class="quantity">{{ quantity }}</text>
          <uni-icons
            type="plus"
            size="20"
            color="#007AFF"
            @click="increaseQuantity"
          />
        </view>

        <button class="add-to-cart" @tap="handleAddToCart">加入购物车</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { menuApi, cartApi } from "@/api";
import store from "@/store";

const menuItem = ref({});
const quantity = ref(1);
const keyword = ref("");
const searchResults = ref([]);

// 是否为搜索模式
const isSearchMode = computed(() => !!keyword.value);

// 加入购物车
const handleAddToCart = async () => {
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
      userId: userId,
      menuItemId: menuItem.value.id,
      quantity: quantity.value,
    });

    uni.showToast({
      title: "已加入购物车",
      icon: "success",
    });

    // 可选：跳转到购物车页面
    // uni.switchTab({ url: '/pages/cart/cart' });
  } catch (error) {
    console.error("添加到购物车失败:", error);
    uni.showToast({
      title: "添加失败",
      icon: "none",
    });
  }
};

// 获取菜品详情
const loadMenuItemDetail = async (id) => {
  try {
    if (!id) return;
    console.log("加载菜品详情, id:", id);
    const res = await menuApi.getMenuItem(id);
    menuItem.value = res;
  } catch (error) {
    console.error("获取菜品详情失败:", error);
    uni.showToast({
      title: "获取菜品详情失败",
      icon: "none",
    });
  }
};

// 搜索菜品
const searchMenuItems = async () => {
  try {
    if (!keyword.value) return;
    console.log("搜索关键词:", keyword.value);
    const res = await menuApi.searchMenuItems(keyword.value);
    searchResults.value = res || [];
  } catch (error) {
    console.error("搜索失败:", error);
    uni.showToast({
      title: "搜索失败",
      icon: "none",
    });
    searchResults.value = [];
  }
};

// 增加数量
const increaseQuantity = () => {
  quantity.value++;
};

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 显示菜品详情
const showDetail = (id) => {
  uni.redirectTo({
    url: `/pages/menu/detail?id=${id}`,
  });
};

onMounted(() => {
  // 获取当前页面实例
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];

  // 获取页面参数
  const options = currentPage.$page?.options || currentPage.options || {};
  console.log("页面参数:", options);

  const { id, keyword: searchKeyword } = options;

  if (id) {
    // 如果有id参数，加载菜品详情
    loadMenuItemDetail(id);
  } else if (searchKeyword) {
    // 如果有搜索关键词，进行搜索
    keyword.value = decodeURIComponent(searchKeyword);
    searchMenuItems();
  }
});
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;

  .search-result {
    padding: 30rpx;

    .result-header {
      margin-bottom: 30rpx;

      .result-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
      }

      .result-count {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
        display: block;
      }
    }

    .result-list {
      .result-item {
        display: flex;
        background: #fff;
        padding: 20rpx;
        border-radius: 16rpx;
        margin-bottom: 20rpx;

        .item-image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 12rpx;
          margin-right: 20rpx;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .item-name {
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
          }

          .item-desc {
            font-size: 26rpx;
            color: #999;
            margin: 12rpx 0;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }

          .item-bottom {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .item-price {
              font-size: 32rpx;
              color: #ff5a5f;
              font-weight: bold;
            }

            .sales-count {
              font-size: 24rpx;
              color: #999;
            }
          }
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }
  }

  .food-image {
    width: 100%;
    height: 500rpx;
  }

  .food-info {
    margin-top: -40rpx;
    padding: 40rpx 30rpx;
    background: #fff;
    border-radius: 40rpx 40rpx 0 0;
    position: relative;

    .basic-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .food-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .food-price {
        font-size: 36rpx;
        color: #ff5a5f;
        font-weight: bold;
      }
    }

    .sales-info {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-bottom: 30rpx;

      .sales-count {
        font-size: 24rpx;
        color: #999;
      }

      .recommend-tag {
        padding: 4rpx 16rpx;
        background: #fff5e6;
        color: #ff9500;
        font-size: 24rpx;
        border-radius: 100rpx;
      }
    }

    .description {
      .desc-title {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 16rpx;
        display: block;
      }

      .desc-content {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 30rpx;
    background: #fff;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .quantity {
        font-size: 30rpx;
        color: #333;
        min-width: 60rpx;
        text-align: center;
      }

      .disabled {
        opacity: 0.5;
      }
    }

    .add-to-cart {
      background: #007aff;
      color: #fff;
      padding: 20rpx 60rpx;
      border-radius: 100rpx;
      font-size: 28rpx;
      border: none;

      &:active {
        transform: scale(0.98);
        background: darken(#007aff, 10%);
      }
    }
  }
}
</style>
