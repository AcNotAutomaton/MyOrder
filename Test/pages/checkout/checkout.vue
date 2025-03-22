<template>
  <view class="checkout-container">
    <!-- 订单信息 -->
    <view class="order-info">
      <view class="section-title">订单信息</view>
      <view class="order-items">
        <view v-for="item in orderItems" :key="item.id" class="order-item">
          <text class="item-name">{{ item.itemName }}</text>
          <text class="item-quantity">x{{ item.quantity }}</text>
          <text class="item-price"
            >¥{{ (item.price * item.quantity).toFixed(2) }}</text
          >
        </view>
      </view>
      <view class="total-amount">
        <text>合计：</text>
        <text class="price">¥{{ order.totalAmount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 支付按钮 -->
    <view class="pay-section">
      <button class="pay-btn" @click="handlePay" :disabled="isPaying">
        {{ isPaying ? "支付中..." : "立即支付" }}
      </button>
    </view>
  </view>
</template>

<script>
import { orderApi } from "@/api";
import store from "@/store";

export default {
  data() {
    return {
      order: null,
      orderItems: [],
      loading: false,
      isPaying: false,
      userId: "",
    };
  },

  onLoad(options) {
    this.userId = store.getUserId();
    const orderId = options.orderId;
    console.log(orderId);
    if (orderId) {
      this.loadOrderById(orderId);
    } else {
      this.loadLatestOrder();
    }
  },

  methods: {
    // 根据ID加载订单
    async loadOrderById(orderId) {
      try {
        this.loading = true;
        const order = await orderApi.getOrderDetails(orderId);
        this.order = order;
        this.orderItems = order.orderItems || [];
        console.log(this.order);
      } catch (error) {
        console.error("加载订单详情失败:", error);
        uni.showToast({
          title: "加载订单失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },

    // 加载最新订单
    async loadLatestOrder() {
      try {
        this.loading = true;
        const userId = store.getUserId();
        const orders = await orderApi.getUserOrders(userId, 0, 1);
        if (orders && orders.content && orders.content.length > 0) {
          const latestOrder = orders.content[0];
          await this.loadOrderById(latestOrder.id);
        } else {
          uni.showToast({
            title: "没有找到订单",
            icon: "none",
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        console.error("加载最新订单失败:", error);
        uni.showToast({
          title: "加载订单失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },

    async handlePay() {
      if (this.isPaying) return;

      this.isPaying = true;
      try {
        // 获取支付参数
        const payParams = await orderApi.getWxPayParams(this.order.id);

        // 调用微信支付
        await new Promise((resolve, reject) => {
          uni.requestPayment({
            ...payParams,
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            },
          });
        });

        // 支付成功后处理
        await orderApi.payOrder(this.order.id);

        uni.showToast({
          title: "支付成功",
          icon: "success",
        });

        // 清空购物车
        await cartApi.clearCart(this.userId);

        // 延迟跳转到订单列表
        setTimeout(() => {
          uni.redirectTo({
            url: "/pages/menu/menu",
          });
        }, 1500);
      } catch (error) {
        console.error("支付失败:", error);
        uni.showToast({
          title: error.message || "支付失败",
          icon: "none",
        });
      } finally {
        this.isPaying = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.checkout-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.order-info {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .order-items {
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .item-name {
        flex: 1;
        font-size: 28rpx;
      }

      .item-quantity {
        color: #666;
        margin: 0 20rpx;
      }

      .item-price {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

  .total-amount {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1px solid #eee;

    .price {
      color: #f56c6c;
      font-size: 36rpx;
      font-weight: bold;
      margin-left: 20rpx;
    }
  }
}

.pay-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .pay-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: #07c160;
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;

    &:active {
      background-color: #06ae56;
    }

    &[disabled] {
      background-color: #ccc;
    }
  }
}
</style>
