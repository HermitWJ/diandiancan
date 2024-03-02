const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    username: "未登录",
    ifname: "已实名",
    user: null,
    orderCount: 0,
    collectCount: 0,
    couponCount: 0
  },

  toLogin() {
    wx.navigateTo({
      url: '/pages/my/login/login',
    })
  },

  loginout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 退出前清理当前用户的购物车缓存
          const userInfo = wx.getStorageSync('UserInfo')
          if (userInfo && userInfo.number) {
            const userId = userInfo.number
            // 清理所有餐厅的购物车数据
            const catIds = ['1', '2', '3', '4', '5', '6']
            catIds.forEach(catId => {
              wx.removeStorageSync('cart_' + userId + '_' + catId)
              wx.removeStorageSync('totalmoney_' + userId + '_' + catId)
            })
            wx.removeStorageSync('cart_' + userId)
            wx.removeStorageSync('totalmoney_' + userId)
          }
          wx.removeStorage({ key: 'UserInfo' })
          app.globalData.userInfo = null
          app.globalData.orderList = null
          wx.redirectTo({
            url: '/pages/my/login/login',
          })
        }
      }
    })
  },

  // 页面跳转
  goPage(e) {
    const url = e.currentTarget.dataset.url
    // 判断是否是tabBar页面
    if (url === '/pages/cart/cart') {
      wx.switchTab({ url })
    } else {
      wx.navigateTo({ url })
    }
  },

  // 加载统计数据
  loadStats() {
    // 获取订单数量（从list集合按用户手机号查询）
    const userInfo = wx.getStorageSync('UserInfo')
    if (userInfo && userInfo.number) {
      db.collection('list').where({
        number: userInfo.number
      }).count().then(res => {
        this.setData({ orderCount: res.total || 0 })
      }).catch(() => {})

      // 获取收藏数量（从collect集合按用户手机号查询）
      db.collection('collect').where({
        number: userInfo.number  // 只统计当前用户的收藏
      }).count().then(res => {
        this.setData({ collectCount: res.total || 0 })
      }).catch(() => {})

      // 获取优惠券数量
      db.collection('favorite').where({
        judge: _.eq(1)
      }).count().then(res => {
        this.setData({ couponCount: res.total || 0 })
      }).catch(() => {})
    }
  },

  onLoad() {
    this.setData({
      user: app.globalData.userInfo
    })
    this.loadStats()
  },

  onShow() {
    this.setData({
      user: app.globalData.userInfo
    })
    this.loadStats()
  },

  onPullDownRefresh() {
    this.loadStats()
    wx.stopPullDownRefresh()
  },

  onShareAppMessage() {
    return {
      title: '西理工预点餐 - 美食从这里开始'
    }
  }
})
