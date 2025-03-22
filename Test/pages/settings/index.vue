<template>
  <view class="settings-container">
    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 通用设置 -->
      <view class="settings-group">
        <view class="group-title">通用设置</view>
        <view class="setting-item" @tap="clearCache">
          <text class="item-label">清除缓存</text>
          <view class="item-right">
            <text class="cache-size">{{ cacheSize }}</text>
            <uni-icons type="right" size="16" color="#999"/>
          </view>
        </view>
        <view class="setting-item">
          <text class="item-label">消息通知</text>
          <switch :checked="notificationEnabled" @change="toggleNotification" color="#007AFF"/>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="settings-group">
        <view class="group-title">其他设置</view>
        <view class="setting-item" @tap="checkUpdate">
          <text class="item-label">检查更新</text>
          <view class="item-right">
            <text class="version">当前版本 {{ version }}</text>
            <uni-icons type="right" size="16" color="#999"/>
          </view>
        </view>
        <view class="setting-item" @tap="showPrivacy">
          <text class="item-label">隐私政策</text>
          <uni-icons type="right" size="16" color="#999"/>
        </view>
        <view class="setting-item" @tap="showAgreement">
          <text class="item-label">用户协议</text>
          <uni-icons type="right" size="16" color="#999"/>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const cacheSize = ref('0.0MB')
    const notificationEnabled = ref(true)
    const version = ref('1.0.0')

    // 清除缓存
    const clearCache = () => {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '清理中...' })
            setTimeout(() => {
              uni.hideLoading()
              uni.showToast({
                title: '清除成功',
                icon: 'success'
              })
              cacheSize.value = '0.0MB'
            }, 1000)
          }
        }
      })
    }

    // 切换通知
    const toggleNotification = (e) => {
      notificationEnabled.value = e.detail.value
    }

    // 检查更新
    const checkUpdate = () => {
      uni.showLoading({ title: '检查中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已是最新版本',
          icon: 'none'
        })
      }, 1000)
    }

    // 显示隐私政策
    const showPrivacy = () => {
      uni.navigateTo({
        url: '/pages/webview/privacy'
      })
    }

    // 显示用户协议
    const showAgreement = () => {
      uni.navigateTo({
        url: '/pages/webview/agreement'
      })
    }

    return {
      cacheSize,
      notificationEnabled,
      version,
      clearCache,
      toggleNotification,
      checkUpdate,
      showPrivacy,
      showAgreement
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20rpx;

  .settings-group {
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    padding: 0 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);

    .group-title {
      font-size: 28rpx;
      color: #999;
      padding: 30rpx 0 20rpx;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0;
      border-top: 1px solid rgba(0,0,0,0.05);

      &:first-child {
        border-top: none;
      }

      .item-label {
        font-size: 30rpx;
        color: #333;
      }

      .item-right {
        display: flex;
        align-items: center;
        gap: 10rpx;

        .cache-size,
        .version {
          font-size: 26rpx;
          color: #999;
          margin-right: 10rpx;
        }
      }
    }
  }
}
</style> 