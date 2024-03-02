// pages/mycoupon/mycoupon.js
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    tabIndex: 0,        // 0: 可使用, 1: 已过期
    validList: [],       // 可使用的优惠券
    expiredList: [],     // 已过期的优惠券
    datenow: 0           // 当前日期数值
  },

  onLoad() {
    this.getCurrentDate()
    this.getData()
  },

  onShow() {
    this.getCurrentDate()
    this.getData()
  },

  // 获取当前日期数值 (如 20260225)
  getCurrentDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    this.setData({
      datenow: year * 10000 + month * 100 + day
    })
  },

  // 获取已领取的优惠券
  getData() {
    wx.showLoading({ title: '加载中...' })
    db.collection('favorite').where({
      judge: _.eq(1)
    }).get().then(res => {
      wx.hideLoading()
      const list = res.data || []
      const datenow = this.data.datenow
      const validList = []
      const expiredList = []

      list.forEach(item => {
        if (item.timeset && item.timeset < datenow) {
          expiredList.push(item)
        } else {
          validList.push(item)
        }
      })

      this.setData({
        validList: validList,
        expiredList: expiredList
      })
    }).catch(() => {
      wx.hideLoading()
    })
  },

  // 切换标签
  switchTab(e) {
    this.setData({
      tabIndex: parseInt(e.currentTarget.dataset.index)
    })
  },

  // 使用优惠券
  useCoupon(e) {
    wx.showToast({
      title: '下单时自动抵扣',
      icon: 'none'
    })
  },

  // 去领券中心
  goCouponCenter() {
    wx.navigateTo({
      url: '/pages/my/coupon/coupon'
    })
  },

  onShareAppMessage() {
    return {
      title: '我的优惠券'
    }
  }
})
