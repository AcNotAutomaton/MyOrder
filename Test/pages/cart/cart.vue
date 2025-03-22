<template>
  <view class="cart-container">
    <!-- 空购物车提示 -->
    <view v-if="cartItems.length === 0" class="empty-cart">
      <uni-icons type="cart" size="64" color="#999" />
      <text class="empty-text">购物车是空的</text>
      <button class="go-shopping" @click="navigateToMenu">去逛逛</button>
    </view>

    <!-- 购物车列表 -->
    <view v-else class="cart-content">
      <view class="cart-list">
        <view class="cart-item" v-for="item in cartItems" :key="item.id">
          <image :src="item.itemImageUrl" mode="aspectFill" class="food-img" />
          <view class="item-info">
            <text class="item-name">{{ item.itemName }}</text>
            <text class="item-price">¥{{ item.itemPrice }}</text>
            <view class="quantity-control">
              <uni-icons
                type="minus"
                size="20"
                :color="item.quantity <= 1 ? '#ccc' : '#007AFF'"
                @click="decreaseQuantity(item)"
              />
              <text class="quantity">{{ item.quantity }}</text>
              <uni-icons
                type="plus"
                size="20"
                color="#007AFF"
                @click="increaseQuantity(item)"
              />
            </view>
          </view>
          <uni-icons
            type="trash"
            size="24"
            color="#ff5a5f"
            @click="removeItem(item)"
            class="delete-btn"
          />
        </view>
      </view>

      <!-- 结算栏 -->
      <view class="checkout-bar">
        <view class="total-info">
          <text class="total-label">合计:</text>
          <text class="total-price">¥{{ totalAmount }}</text>
        </view>
        <button
          class="checkout-btn"
          :disabled="cartItems.length === 0"
          @click="checkout"
        >
          去结算
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { cartApi, orderApi } from "@/api";
import store from "@/store";

export default {
  data() {
    return {
      cartItems: [],
      userId: "",
    };
  },

  computed: {
    totalAmount() {
      return this.cartItems
        .reduce((sum, item) => {
          return sum + item.itemPrice * item.quantity;
        }, 0)
        .toFixed(2);
    },
  },

  onShow() {
    this.userId = store.getUserId();
    if (!this.userId) {
      uni.showModal({
        title: "提示",
        content: "请先登录后再查看购物车",
        showCancel: false,
        success: () => {
          uni.switchTab({
            url: "/pages/menu/menu",
          });
        },
      });
      return;
    }
    this.loadCartItems();
    store.updateCartBadge();
  },

  methods: {
    async loadCartItems() {
      try {
        this.cartItems = await cartApi.getCartItems(this.userId);
        console.log(this.cartItems);
        console.log("购物车数据:", this.cartItems);
      } catch (error) {
        console.error("加载购物车失败:", error);
        uni.showToast({
          title: "加载购物车失败",
          icon: "none",
        });
      }
    },

    // 减少数量
    async decreaseQuantity(item) {
      if (item.quantity <= 1) return;
      try {
        await cartApi.saveCartItem({
          userId: this.userId,
          menuItemId: item.menuItemId,
          quantity: -1,
        });
        await this.loadCartItems();
        await store.updateCartBadge();
      } catch (error) {
        console.error("减少数量失败:", error);
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },

    // 增加数量
    async increaseQuantity(item) {
      try {
        await cartApi.saveCartItem({
          userId: this.userId,
          menuItemId: item.menuItemId,
          quantity: 1,
        });
        await this.loadCartItems();
        await store.updateCartBadge();
      } catch (error) {
        console.error("增加数量失败:", error);
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },

    // 删除商品
    async removeItem(item) {
      try {
        await cartApi.removeCartItem(this.userId, item.menuItemId);
        await this.loadCartItems();
        await store.updateCartBadge();
        uni.showToast({
          title: "删除成功",
          icon: "success",
        });
      } catch (error) {
        console.error("删除失败:", error);
        uni.showToast({
          title: "删除失败",
          icon: "none",
        });
      }
    },

    // 跳转到菜单页
    navigateToMenu() {
      uni.switchTab({
        url: "/pages/menu/menu",
      });
    },

    // 去结算
    async checkout() {
      if (this.cartItems.length === 0) return;
      try {
        const order = await orderApi.createOrder(this.userId);
        console.log(order);
        uni.navigateTo({
          url: `/pages/checkout/checkout?orderId=${order.id}`,
        });
      } catch (error) {
        console.error("创建订单失败:", error);
        uni.showToast({
          title: "创建订单失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.cart-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f7f9 0%, #ffffff 100%);
  padding-bottom: 120rpx;

  .empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;

    .empty-text {
      color: #999;
      font-size: 28rpx;
      margin: 30rpx 0;
    }

    .go-shopping {
      background: #007aff;
      color: #fff;
      padding: 20rpx 60rpx;
      border-radius: 100rpx;
      font-size: 28rpx;
      border: none;

      &:active {
        background: darken(#007aff, 10%);
      }
    }
  }

  .cart-content {
    padding: 20rpx;

    .cart-list {
      .cart-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        background: #ffffff;
        border-radius: 20rpx;
        margin-bottom: 20rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

        .food-img {
          width: 140rpx;
          height: 140rpx;
          border-radius: 16rpx;
          margin-right: 20rpx;
        }

        .item-info {
          flex: 1;

          .item-name {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
          }

          .item-price {
            font-size: 32rpx;
            color: #007aff;
            font-weight: bold;
            margin: 10rpx 0;
          }

          .quantity-control {
            display: flex;
            align-items: center;
            margin-top: 16rpx;

            .quantity {
              margin: 0 30rpx;
              font-size: 28rpx;
              color: #333;
            }
          }
        }

        .delete-btn {
          padding: 20rpx;
        }
      }
    }
  }

  .checkout-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

    .total-info {
      .total-label {
        font-size: 28rpx;
        color: #666;
      }

      .total-price {
        font-size: 36rpx;
        color: #007aff;
        font-weight: bold;
        margin-left: 16rpx;
      }
    }

    .checkout-btn {
      background: #007aff;
      color: #fff;
      padding: 20rpx 60rpx;
      border-radius: 100rpx;
      font-size: 28rpx;
      border: none;

      &:disabled {
        background: #ccc;
      }

      &:active {
        background: darken(#007aff, 10%);
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .cart-container {
    background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);

    .cart-item {
      background: rgba(255, 255, 255, 0.05) !important;

      .item-name {
        color: #fff !important;
      }
    }

    .checkout-bar {
      background: rgba(26, 26, 26, 0.9);

      .total-label {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}
</style>
