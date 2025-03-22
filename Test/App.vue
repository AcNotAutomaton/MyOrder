<template>
	<view>
		<router-view></router-view>
	</view>
</template>

<script>
import store from './store'

export default {
	onLaunch: function() {
		console.log('App Launch')
		// 初始化用户状态
		store.initUserState()
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
	/*每个页面公共css */
</style>
