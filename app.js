// app.js
const envConfig = require('./config/env.js')

App({
  onLaunch() {
    wx.cloud.init({
      env: envConfig.cloudEnvId
    })
  },
  globalData: {
    userInfo: null,
    globalList: []
  }
})
