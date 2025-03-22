<template>
  <view class="container">
    <!-- 顶部搜索区 -->
    <view class="search-section">
      <uni-search-bar
        class="custom-search"
        :radius="100"
        placeholder="搜索你喜欢的美食"
        v-model="searchKeyword"
        @confirm="handleSearch"
        bgColor="#ffffff"
        :focus="false"
      >
        <uni-icons slot="searchIcon" color="#666" size="18" type="search" />
      </uni-search-bar>
    </view>

    <!-- 轮播图区域 -->
    <view class="swiper-section">
      <swiper
        class="swiper"
        :circular="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        @change="swiperChange"
      >
        <swiper-item v-for="(item, index) in banners" :key="index">
          <image :src="item.imageUrl" mode="aspectFill" class="swiper-img" />
        </swiper-item>
      </swiper>
      <!-- 自定义指示点 -->
      <view class="custom-indicator">
        <view
          v-for="(item, index) in banners"
          :key="index"
          class="indicator-dot"
          :class="{ active: swiperCurrent === index }"
        ></view>
      </view>
    </view>

    <!-- 分类导航 -->
    <view class="category-section">
      <uni-grid :column="4" :highlight="false" :showBorder="false">
        <uni-grid-item v-for="item in categories" :key="item.id">
          <view class="category-item" @click="handleCategoryClick(item)">
            <view class="icon-box">
              <image :src="item.icon" mode="aspectFit" class="category-icon" />
              <view class="icon-glow"></view>
            </view>
            <text class="category-name">{{ item.name }}</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>

    <!-- 推荐区域 -->
    <view class="section-title">
      <text class="title-text">今日推荐</text>
      <view class="title-right" @tap="navigateToMenu">
        <text class="more-text">查看更多</text>
        <uni-icons type="right" size="14" color="#666" />
      </view>
    </view>

    <scroll-view scroll-x class="recommend-scroll" show-scrollbar="false">
      <view class="recommend-list">
        <view
          class="recommend-item"
          v-for="item in recommendItems"
          :key="item.id"
          @click="navigateToDetail(item)"
        >
          <image :src="item.imageUrl" mode="aspectFill" class="food-img" />
          <view class="food-info">
            <text class="food-name">{{ item.name }}</text>
            <text class="food-desc">{{ item.description }}</text>
            <view class="price-box">
              <text class="price">¥{{ item.price }}</text>
              <view class="add-btn" @tap.stop="addToCart(item)">
                <uni-icons type="plus" size="20" color="#ffffff" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 热销榜单 -->
    <view class="section-title">
      <text class="title-text">热销榜单</text>
      <uni-badge :text="hotItems.length" type="primary" size="small" />
    </view>

    <view class="hot-list">
      <view
        class="hot-item"
        v-for="(item, index) in hotItems"
        :key="item.id"
        @click="navigateToDetail(item)"
      >
        <view class="rank-badge" :class="getBadgeClass(index)">{{
          index + 1
        }}</view>
        <image :src="item.imageUrl" mode="aspectFill" class="hot-img" />
        <view class="hot-info">
          <text class="hot-name">{{ item.name }}</text>
          <text class="hot-desc">{{ item.description }}</text>
          <view class="action-box">
            <text class="hot-price">¥{{ item.price }}</text>
            <view class="add-btn" @tap.stop="addToCart(item)">
              <uni-icons type="plus" size="20" color="#ffffff" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门搜索标签 -->
    <view class="search-tags" v-if="hotSearchTags.length">
      <text class="tag-title">热门搜索</text>
      <view class="tags-wrapper">
        <text
          v-for="(tag, index) in hotSearchTags"
          :key="index"
          class="search-tag"
          @tap="handleTagClick(tag)"
        >
          {{ tag }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { menuApi, cartApi } from "@/api";
import store from "@/store";

const searchKeyword = ref("");
const swiperCurrent = ref(0);
const banners = ref([
  { imageUrl: "/static/banner1.jpg" },
  { imageUrl: "/static/banner2.jpg" },
  { imageUrl: "/static/banner3.jpg" },
]);
const categories = ref([
  { id: 1, name: "热菜", icon: "/static/icons/hot.png" },
  { id: 2, name: "凉菜", icon: "/static/icons/cold.png" },
  { id: 3, name: "主食", icon: "/static/icons/staple.png" },
  { id: 4, name: "汤类", icon: "/static/icons/drink.png" },
]);
const recommendItems = ref([]);
const hotItems = ref([]);
const hotSearchTags = ref([
  "红烧肉",
  "宫保鸡丁",
  "水煮鱼",
  "麻婆豆腐",
  "炒青菜",
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
    const res = await menuApi.getRecommendItems();
    recommendItems.value = res.data;
  } catch (error) {
    console.error("推荐菜品加载失败:", error);
    uni.showToast({
      title: "加载推荐菜品失败",
      icon: "none",
    });
  }
};

const loadHotItems = async () => {
  try {
    const res = await menuApi.getHotItems(0, 10);
    hotItems.value = res.data || [];
  } catch (error) {
    console.error("热销菜品加载失败:", error);
    uni.showToast({
      title: "加载热销菜品失败",
      icon: "none",
    });
    hotItems.value = [];
  }
};

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: "请输入搜索关键词",
      icon: "none",
    });
    return;
  }
  uni.navigateTo({
    url: `/pages/menu/detail?keyword=${encodeURIComponent(
      searchKeyword.value
    )}`,
  });
};

const handleCategoryClick = (category) => {
  console.log("点击分类:", category);
  store.setCurrentCategoryId(category.id);
  console.log("当前分类ID:", store.getCurrentCategoryId());
  uni.switchTab({
    url: `/pages/menu/menu`,
  });
};

const navigateToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/menu/detail?id=${item.id}`,
  });
};

const navigateToMenu = () => {
  uni.switchTab({
    url: "/pages/menu/menu",
  });
};

const addToCart = async (item) => {
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
      menuItemId: item.id,
      quantity: 1,
    });

    uni.showToast({
      title: "已加入购物车",
      icon: "success",
    });
  } catch (error) {
    console.error("添加失败:", error);
    uni.showToast({
      title: "添加失败",
      icon: "none",
    });
  }
};

const handleTagClick = (tag) => {
  searchKeyword.value = tag;
  handleSearch();
};

onMounted(() => {
  loadRecommendItems();
  loadHotItems();
});
</script>

<style lang="scss" scoped>
// 文本省略混入 - 需要放在最前面
@mixin text-ellipsis($lines: 1) {
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

.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f7f9 0%, #ffffff 100%);

  .search-section {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 20rpx 30rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);

    .custom-search {
      :deep(.uni-searchbar__box) {
        border: none;
        background: #f5f6f8;
        box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      }
    }
  }

  .swiper-section {
    margin: 20rpx 30rpx;
    border-radius: 24rpx;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);

    .swiper {
      height: 300rpx;

      .swiper-img {
        width: 100%;
        height: 100%;
      }
    }

    .custom-indicator {
      position: absolute;
      bottom: 20rpx;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12rpx;

      .indicator-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 6rpx;
        background: rgba(255, 255, 255, 0.6);
        transition: all 0.3s;

        &.active {
          width: 24rpx;
          background: #ffffff;
        }
      }
    }
  }

  .category-section {
    margin: 30rpx 20rpx;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 24rpx;
    backdrop-filter: blur(20px);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;

      .icon-box {
        position: relative;
        width: 100rpx;
        height: 100rpx;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 30rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
        transition: all 0.3s;

        .category-icon {
          width: 60rpx;
          height: 60rpx;
          z-index: 1;
        }

        .icon-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0) 70%
          );
          opacity: 0;
          transition: opacity 0.3s;
        }

        &:active {
          transform: scale(0.95);

          .icon-glow {
            opacity: 1;
          }
        }
      }

      .category-name {
        font-size: 26rpx;
        color: #333;
        margin-top: 16rpx;
      }
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 24rpx;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 32rpx;
        background: #007aff;
        border-radius: 4rpx;
      }
    }

    .title-right {
      display: flex;
      align-items: center;
      gap: 4rpx;

      .more-text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .recommend-scroll {
    white-space: nowrap;
    padding: 0 30rpx;

    .recommend-list {
      display: flex;
      padding-bottom: 30rpx;

      .recommend-item {
        flex-shrink: 0;
        width: 300rpx;
        margin-right: 24rpx;
        background: #ffffff;
        border-radius: 20rpx;
        overflow: hidden;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
        transition: all 0.3s;

        &:active {
          transform: scale(0.98);
        }

        .food-img {
          width: 100%;
          height: 300rpx;
        }

        .food-info {
          padding: 20rpx;

          .food-name {
            font-size: 28rpx;
            font-weight: 600;
            color: #333;
          }

          .food-desc {
            font-size: 24rpx;
            color: #999;
            margin: 8rpx 0;
            @include text-ellipsis(1);
          }

          .price-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16rpx;

            .price {
              font-size: 32rpx;
              color: #ff5a5f;
              font-weight: bold;
            }

            .add-btn {
              width: 48rpx;
              height: 48rpx;
              background: #007aff;
              border-radius: 24rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s;

              &:active {
                transform: scale(0.9);
                background: darken(#007aff, 10%);
              }
            }
          }
        }
      }
    }
  }

  .hot-list {
    padding: 0 30rpx;

    .hot-item {
      display: flex;
      padding: 20rpx;
      margin-bottom: 24rpx;
      background: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
      position: relative;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }

      .rank-badge {
        position: absolute;
        left: 20rpx;
        top: 20rpx;
        width: 40rpx;
        height: 40rpx;
        border-radius: 20rpx;
        background: #999;
        color: #fff;
        font-size: 24rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;

        &.rank-1 {
          background: #ff6b6b;
        }
        &.rank-2 {
          background: #ff922b;
        }
        &.rank-3 {
          background: #ffd43b;
        }
      }

      .hot-img {
        width: 180rpx;
        height: 180rpx;
        border-radius: 16rpx;
        margin-right: 24rpx;
      }

      .hot-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .hot-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .hot-desc {
          font-size: 26rpx;
          color: #999;
          margin: 12rpx 0;
          @include text-ellipsis(2);
        }

        .action-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;

          .hot-price {
            font-size: 32rpx;
            color: #ff5a5f;
            font-weight: bold;
          }

          .add-btn {
            width: 48rpx;
            height: 48rpx;
            background: #007aff;
            border-radius: 24rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;

            &:active {
              transform: scale(0.9);
              background: darken(#007aff, 10%);
            }
          }
        }
      }
    }
  }

  .search-tags {
    padding: 20rpx 30rpx;

    .tag-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
      display: block;
    }

    .tags-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }

    .search-tag {
      padding: 8rpx 24rpx;
      background: #f5f5f5;
      border-radius: 100rpx;
      font-size: 24rpx;
      color: #666;

      &:active {
        background: #e0e0e0;
      }
    }
  }
}
</style>
