<template>
  <view class="user-container">
    <!-- 顶部背景 -->
    <view class="header-bg">
      <uni-card class="user-card">
        <view class="user-info">
          <button 
            v-if="!isLoggedIn" 
            class="avatar-box login-btn" 
            @click="handleLogin"
            open-type="getUserInfo"
            @getuserinfo="onGetUserInfo"
          >
            <uni-icons type="person" size="50" color="#999"/>
            <text class="login-tip">点击登录</text>
          </button>
          <view class="avatar-box" v-else>
            <image :src="userInfo.avatarUrl" mode="aspectFill" class="avatar"/>
            <view class="user-text">
              <text class="nickname">{{ userInfo.nickname }}</text>
              <text class="user-id">ID: {{ userInfo.id }}</text>
            </view>
          </view>
          <uni-icons type="gear" size="24" color="#666" @click="goToSettings"/>
        </view>
      </uni-card>
    </view>

    <!-- 订单统计 -->
    <uni-section title="我的订单" type="line">
      <uni-grid :column="4" :highlight="false" :showBorder="false">
        <uni-grid-item v-for="(stat, index) in orderStats" :key="index" @click="goToOrders(stat.status)">
          <view class="stat-item">
            <text class="stat-num">{{ stat.count }}</text>
            <text class="stat-label">{{ stat.label }}</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </uni-section>

    <!-- 功能菜单 -->
    <uni-section title="我的服务" type="line" class="menu-section">
      <view class="menu-grid">
        <view 
          class="menu-item" 
          v-for="item in menuItems" 
          :key="item.id"
          @tap="handleMenuClick(item)"
        >
          <uni-icons 
            custom-prefix="custom-icon"
            :type="item.icon" 
            size="28" 
            :color="item.color"
          />
          <text class="menu-name">{{ item.name }}</text>
          <uni-badge 
            v-if="item.badge" 
            :text="item.badge" 
            :type="item.badgeType || 'error'" 
            absolute="rightTop"
          />
        </view>
      </view>
    </uni-section>

    <!-- 退出按钮弹窗 -->
    <uni-popup ref="logoutPopupRef" type="dialog">
      <uni-popup-dialog
        type="warning"
        title="提示"
        content="确定要退出登录吗？"
        :duration="2000"
        :before-close="true"
        @confirm="confirmLogout"
        @close="closeLogout"
      />
    </uni-popup>

    <view class="bottom-area" v-if="isLoggedIn">
      <button class="logout-btn" @tap="handleLogout">
        <uni-icons type="poweroff" size="16" color="#ff5a5f"/>
        <text>退出登录</text>
      </button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { userApi } from '@/api'
import store from '@/store'

export default {
  setup() {
    const isLoggedIn = ref(false)
    const userInfo = reactive({
      id: '',
      openId: '',
      nickname: '',
      avatarUrl: '',
      gender: 0
    })
    const orderStats = ref([
      { label: '全部订单', count: 0, status: 'all' },
      { label: '待付款', count: 0, status: 'pending' },
      { label: '进行中', count: 0, status: 'processing' },
      { label: '已完成', count: 0, status: 'completed' }
    ])
    const menuItems = ref([
      { 
        id: 1, 
        name: '我的订单', 
        icon: 'list', 
        color: '#007AFF',
        path: '/pages/order/list'
      },
      { 
        id: 2, 
        name: '优惠券', 
        icon: 'ticket', 
        color: '#51cf66',
        badge: '2',
        badgeType: 'error',
        path: '/pages/coupon/list'
      },
      { 
        id: 3, 
        name: '联系客服',
        icon: 'headphones', 
        color: '#fcc419',
        path: '/pages/service/contact'
      },
      {
        id: 4,
        name: '设置',
        icon: 'gear',
        color: '#666',
        path: '/pages/settings/index'
      }
    ])

    // 添加 logoutPopup 的引用
    const logoutPopupRef = ref(null)

    // 获取用户信息回调
    const onGetUserInfo = async (e) => {
      try {
        if (e.detail.errMsg !== 'getUserInfo:ok') {
          throw new Error('用户拒绝授权')
        }

        // 获取登录code
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: res => resolve(res),
            fail: err => reject(err)
          })
        })

        // 调用后端登录接口
        const res = await userApi.wxLogin({
          code: loginRes.code,
          userInfo: e.detail.userInfo
        })

        // 更新状态
        Object.assign(userInfo, {
          ...res.user,
          nickName: e.detail.userInfo.nickName,
          avatarUrl: e.detail.userInfo.avatarUrl,
          gender: e.detail.userInfo.gender
        })
        
        store.login(userInfo, res.token)
        isLoggedIn.value = true

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        console.log(res)
        console.log(userInfo)
      } catch (error) {
        console.error('登录失败:', error)
        if (error.message === '用户拒绝授权') {
          uni.showModal({
            title: '提示',
            content: '需要您的授权才能继续使用',
            showCancel: false
          })
        } else {
          uni.showToast({
            title: error.message || '登录失败',
            icon: 'none'
          })
        }
      }
    }

    // 确认退出登录
    const confirmLogout = () => {
      store.logout()
      isLoggedIn.value = false
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
      logoutPopupRef.value.close()
    }

    // 关闭退出登录弹窗
    const closeLogout = () => {
      logoutPopupRef.value.close()
    }

    // 显示退出登录弹窗
    const handleLogout = () => {
      logoutPopupRef.value.open()
    }

    // 跳转设置页面
    const goToSettings = () => {
      uni.navigateTo({
        url: '/pages/settings/index'
      })
    }

    // 跳转订单列表
    const goToOrders = (status) => {
      if (!isLoggedIn.value) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              handleLogin()
            }
          }
        })
        return
      }
      
      uni.navigateTo({
        url: `/pages/order/list?status=${status}`
      })
    }

    // 处理菜单点击
    const handleMenuClick = (item) => {
      if (!isLoggedIn.value) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              handleLogin()
            }
          }
        })
        return
      }
      
      uni.navigateTo({
        url: item.path
      })
    }

    return {
      isLoggedIn,
      userInfo,
      orderStats,
      menuItems,
      handleLogout,
      goToSettings,
      goToOrders,
      handleMenuClick,
      onGetUserInfo,
      logoutPopupRef,
      confirmLogout,
      closeLogout
    }
  },
  
  onShow() {
   
  }
}
</script>

<style lang="scss" scoped>
.user-container {
  min-height: 100vh;
  background: #f7f7f7;

  .header-bg {
    height: 200rpx;
    background: linear-gradient(120deg, #007AFF, #00b4ff);
    position: relative;
    
    .user-card {
      position: absolute;
      left: 30rpx;
      right: 30rpx;
      bottom: -60rpx;
      background: #fff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);

      :deep(.uni-card__content) {
        padding: 0;
      }

      .user-info {
        padding: 24rpx 30rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .avatar-box {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50rpx;
            background: #f5f5f5;
          }

          .user-text {
            display: flex;
            flex-direction: column;
            gap: 6rpx;

            .nickname {
              font-size: 32rpx;
              font-weight: 600;
              color: #333;
            }

            .user-id {
              font-size: 24rpx;
              color: #999;
            }
          }

          .login-tip {
            font-size: 28rpx;
            color: #666;
            margin-left: 16rpx;
          }
        }
      }
    }
  }

  :deep(.uni-section) {
    margin-top: 80rpx;
    background: #fff;

    .uni-section-header {
      padding: 20rpx 30rpx 16rpx;
      
      .uni-section-header__content {
        .uni-section__content-title {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }
      }
    }

    &.menu-section {
      margin-top: 2rpx;
      border-top: 1rpx solid #f0f0f0;
    }

    &:not(:last-child) {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 30rpx;
        right: 30rpx;
        height: 1rpx;
        background: #f0f0f0;
      }
    }
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1rpx;
      background: #f0f0f0;
    }

    &:last-child::after {
      display: none;
    }

    .stat-num {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      line-height: 1;
    }

    .stat-label {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    padding: 20rpx 30rpx 30rpx;

    .menu-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      padding: 24rpx 16rpx;
      background: #f8f9fa;
      border-radius: 16rpx;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
        background: #f0f0f0;
      }

      .uni-icons {
        background: rgba(0,0,0,0.04);
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin-bottom: 6rpx;
      }

      .menu-name {
        font-size: 26rpx;
        color: #666;
      }

      :deep(.uni-badge) {
        transform: translate(50%, -50%);
      }
    }
  }

  .bottom-area {
    padding: 30rpx;

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
      height: 88rpx;
      background: #fff;
      border-radius: 44rpx;
      color: #ff5a5f;
      font-size: 28rpx;
      border: none;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);

      &:active {
        transform: scale(0.98);
        background: #f8f8f8;
      }
    }
  }

  .login-btn {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: normal !important;
    color: inherit !important;
    font-size: inherit !important;
    font-weight: normal !important;
    
    &::after {
      border: none !important;
    }
    
    &.button-hover {
      opacity: 0.8;
      background: none !important;
    }
  }
}
</style> 