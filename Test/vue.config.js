const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname)
      }
    }
  },
  transpileDependencies: ['@dcloudio/uni-ui']
} 