<template>
  <view class="order-container">
    <!-- 状态标签栏 -->
    <scroll-view scroll-x class="status-scroll" :show-scrollbar="false">
      <view class="status-tabs">
        <view
          v-for="tab in statusTabs"
          :key="tab.value"
          class="status-tab"
          :class="{ active: currentStatus === tab.value }"
          @tap="switchStatus(tab.value)"
        >
          {{ tab.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <scroll-view
      scroll-y
      class="order-list"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 订单项 -->
      <view v-if="orderList.length > 0" class="order-items">
        <view v-for="order in orderList" :key="order.id" class="order-item">
          <!-- 订单头部 -->
          <view class="order-header">
            <text class="order-number">订单号：{{ order.orderNumber }}</text>
            <text class="order-status">{{ getStatusText(order.status) }}</text>
          </view>

          <!-- 订单商品列表 -->
          <view class="order-goods">
            <view
              v-for="item in order.orderItems"
              :key="item.id"
              class="goods-item"
            >
              <text class="goods-name">{{ item.itemName }}</text>
              <text class="goods-quantity">x{{ item.quantity }}</text>
              <text class="goods-price">¥{{ item.price.toFixed(2) }}</text>
            </view>
          </view>

          <!-- 订单底部 -->
          <view class="order-footer">
            <view class="order-info">
              <text class="order-time">{{ formatTime(order.createTime) }}</text>
              <text class="order-total"
                >总计：¥{{ order.totalAmount.toFixed(2) }}</text
              >
            </view>

            <!-- 订单操作按钮 -->
            <view class="order-actions">
              <template v-if="order.status === 'PENDING'">
                <button class="action-btn primary" @tap.stop="payOrder(order)">
                  立即支付
                </button>
                <button class="action-btn" @tap.stop="cancelOrder(order)">
                  取消订单
                </button>
              </template>
              <template v-else-if="order.status === 'COMPLETED'">
                <button class="action-btn" @tap.stop="deleteOrder(order)">
                  删除订单
                </button>
                <button class="action-btn primary" @tap.stop="buyAgain(order)">
                  再次购买
                </button>
              </template>
              <template v-else-if="order.status === 'PAID'">
                <button class="action-btn" disabled>制作中</button>
              </template>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <uni-icons type="shop" size="50" color="#999" />
        <text class="empty-text">暂无相关订单</text>
      </view>

      <!-- 加载更多 -->
      <uni-load-more :status="loadMoreStatus" />
    </scroll-view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { orderApi } from "@/api";
import store from "@/store";

export default {
  setup() {
    const statusTabs = reactive([
      { name: "全部", value: "all" },
      { name: "待付款", value: "pending" },
      { name: "已付款", value: "paid" },
      { name: "已完成", value: "completed" },
    ]);
    const currentStatus = ref("all");
    const orderList = ref([]);
    const isRefreshing = ref(false);
    const loadMoreStatus = ref("more");
    const page = ref(0);
    const pageSize = 10;
    const hasMore = ref(true);

    // 检查登录状态
    const checkLogin = () => {
      const userId = store.getUserId();
      if (!userId) {
        uni.showModal({
          title: "提示",
          content: "请先登录后查看订单",
          confirmText: "去登录",
          cancelText: "返回",
          success: (res) => {
            if (res.confirm) {
              // 跳转到用户页面
              uni.switchTab({
                url: "/pages/user/user",
              });
            } else {
              // 返回上一页
              uni.navigateBack();
            }
          },
        });
        return false;
      }
      return true;
    };

    // 加载订单
    const loadOrders = async (reset = false) => {
      if (!checkLogin()) return;

      try {
        if (reset) {
          page.value = 0;
          orderList.value = [];
        }

        // 如果没有更多数据，直接返回
        if (!hasMore.value && !reset) return;

        loadMoreStatus.value = "loading";

        const res = await orderApi.getUserOrders({
          userId: store.getUserId(),
          page: page.value,
          size: pageSize,
          status: currentStatus.value,
        });

        // 处理返回的数据
        if (res && res.content) {
          if (reset) {
            orderList.value = res.content;
          } else {
            orderList.value = [...orderList.value, ...res.content];
          }

          // 更新分页状态
          hasMore.value = !res.last;
          loadMoreStatus.value = hasMore.value ? "more" : "noMore";

          if (hasMore.value) {
            page.value++;
          }
        }
      } catch (error) {
        console.error("加载订单失败:", error);
        loadMoreStatus.value = "more";
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    };

    // 刷新
    const onRefresh = async () => {
      if (!checkLogin()) {
        isRefreshing.value = false;
        return;
      }
      isRefreshing.value = true;
      await loadOrders(true);
      isRefreshing.value = false;
    };

    // 加载更多
    const loadMore = () => {
      if (loadMoreStatus.value === "loading" || !hasMore.value) return;
      loadOrders();
    };

    // 切换状态
    const switchStatus = (status) => {
      if (!checkLogin()) return;
      currentStatus.value = status;
      loadOrders(true);
    };

    // 页面挂载
    onMounted(() => {
      if (!checkLogin()) return;
      loadOrders();
    });

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        PENDING: "待付款",
        PROCESSING: "进行中",
        COMPLETED: "已完成",
        CANCELLED: "已取消",
      };
      return statusMap[status] || status;
    };

    // 获取状态颜色
    const getStatusColor = (status) => {
      const colorMap = {
        pending: "#ff9800",
        processing: "#007AFF",
        completed: "#52c41a",
      };
      return colorMap[status] || "#999";
    };

    // 获取商品总数
    const getTotalQuantity = (items) => {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    // 支付订单
    const payOrder = (order) => {
      if (!checkLogin()) return;

      // 跳转到支付页面，传递订单信息
      uni.navigateTo({
        url: `/pages/checkout/checkout?orderId=${order.id}&orderNumber=${order.orderNumber}&amount=${order.totalAmount}`,
      });
    };

    // 取消订单
    const cancelOrder = async (order) => {
      try {
        await orderApi.cancelOrder(order.id);
        uni.showToast({
          title: "订单已取消",
          icon: "success",
        });
        // 刷新订单列表
        loadOrders();
      } catch (error) {
        console.error("取消订单失败:", error);
        uni.showToast({
          title: "取消失败",
          icon: "none",
        });
      }
    };

    // 再次购买
    const buyAgain = async (order) => {
      try {
        // 将商品添加到购物车
        for (const item of order.orderItems) {
          await cartApi.saveCartItem({
            userId: store.getUserId(),
            menuItemId: item.id,
            quantity: item.quantity,
          });
        }
        uni.showToast({
          title: "已添加到购物车",
          icon: "success",
        });
        uni.switchTab({
          url: "/pages/cart/cart",
        });
      } catch (error) {
        console.error("添加到购物车失败:", error);
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    };

    // 删除订单
    const deleteOrder = (order) => {
      uni.showModal({
        title: "提示",
        content: "确定要删除该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await orderApi.deleteOrder(order.id);
              uni.showToast({
                title: "删除成功",
                icon: "success",
              });
              onRefresh();
            } catch (error) {
              console.error("删除订单失败:", error);
              uni.showToast({
                title: "删除失败",
                icon: "none",
              });
            }
          }
        },
      });
    };

    // 在 setup 函数中添加 goToOrderDetail 方法
    const goToOrderDetail = (orderId) => {
      if (!checkLogin()) return;

      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      });
    };

    return {
      statusTabs,
      currentStatus,
      orderList,
      isRefreshing,
      loadMoreStatus,
      switchStatus,
      onRefresh,
      loadMore,
      formatTime,
      getStatusText,
      getStatusColor,
      getTotalQuantity,
      payOrder,
      cancelOrder,
      buyAgain,
      deleteOrder,
      loadOrders,
      goToOrderDetail, // 添加到返回对象中
    };
  },
};
</script>

<style lang="scss" scoped>
.order-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  padding: 0 30rpx;

  .status-scroll {
    background: #fff;
    padding: 24rpx 0;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
    margin: 0 -30rpx;
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }

    .status-tabs {
      display: flex;
      padding: 0 40rpx;
      flex-wrap: nowrap;
      min-width: max-content;

      .status-tab {
        padding: 16rpx 40rpx;
        margin-right: 24rpx;
        border-radius: 32rpx;
        font-size: 28rpx;
        color: #666;
        background: #f0f2f5;
        transition: all 0.3s;
        flex-shrink: 0;
        min-width: 160rpx;
        text-align: center;
        position: relative;
        overflow: hidden;

        &.active {
          color: #fff;
          background: linear-gradient(135deg, #007aff, #0056b3);
          box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
          font-weight: 500;
        }

        &:last-child {
          margin-right: 0;
        }

        &:active {
          transform: scale(0.98);
          opacity: 0.9;
        }
      }
    }
  }

  .order-list {
    flex: 1;
    padding: 30rpx 0;

    .order-items {
      .order-item {
        background: #fff;
        border-radius: 24rpx;
        padding: 30rpx;
        margin: 0 0 30rpx 0;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24rpx;
          border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);

          .order-number {
            font-size: 26rpx;
            color: #666;
          }

          .order-status {
            font-size: 26rpx;
            color: #007aff;
            font-weight: 500;
          }
        }

        .order-goods {
          padding: 24rpx 0;

          .goods-item {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;
            padding: 10rpx 0;

            .goods-name {
              flex: 1;
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
            }

            .goods-quantity {
              font-size: 26rpx;
              color: #666;
              margin: 0 24rpx;
            }

            .goods-price {
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
            }
          }
        }

        .order-footer {
          padding-top: 24rpx;
          border-top: 1rpx solid rgba(0, 0, 0, 0.06);

          .order-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24rpx;

            .order-time {
              font-size: 24rpx;
              color: #999;
            }

            .order-total {
              font-size: 28rpx;
              color: #333;
              font-weight: 600;
            }
          }

          .order-actions {
            display: flex;
            justify-content: flex-end;
            gap: 24rpx;
            width: 100%;

            .action-btn {
              padding: 12rpx 24rpx;
              font-size: 26rpx;
              border-radius: 32rpx;
              background: #f5f7fa;
              color: #666;
              border: none;
              transition: all 0.3s;
              display: flex;
              align-items: center;
              justify-content: center;
              white-space: nowrap;
              line-height: 1;
              height: auto;
              min-width: 140rpx;
              text-align: center;
              margin-left: 16rpx;
              box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

              &.primary {
                background: linear-gradient(135deg, #007aff, #0056b3);
                color: #fff;
                box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2);
              }

              &:active {
                transform: scale(0.98);
                opacity: 0.9;
              }

              &[disabled] {
                background: #f5f5f5;
                color: #999;
                box-shadow: none;
                cursor: not-allowed;
              }
            }
          }
        }
      }
    }

    .empty-state {
      padding: 100rpx 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20rpx;

      .empty-text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}
</style>
