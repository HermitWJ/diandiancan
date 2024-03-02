// pages/my/coupon/coupon.js
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    couponList: [],     // 可领取的优惠券列表
    myCouponCount: 0,   // 我已领取的优惠券数量
    loaded: false
  },

  onLoad() {
    this.loadCoupons()
    this.loadMyCouponCount()
  },

  onShow() {
    this.loadCoupons()
    this.loadMyCouponCount()
  },

  // 加载所有可领取的优惠券
  loadCoupons() {
    db.collection('favorite').get().then(res => {
      let list = res.data || []
      // 标记已领取的券
      list.forEach(item => {
        item.claimed = item.judge === 1
      })
      this.setData({
        couponList: list,
        loaded: true
      })
    }).catch(() => {
      this.setData({ loaded: true })
    })
  },

  // 加载我的优惠券数量
  loadMyCouponCount() {
    db.collection('favorite').where({
      judge: _.eq(1)
    }).count().then(res => {
      this.setData({
        myCouponCount: res.total || 0
      })
    })
  },

  // 领取优惠券
  claimCoupon(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.couponList[index]
    
    if (item.claimed) {
      wx.showToast({ title: '已经领取过了', icon: 'none' })
      return
    }

    wx.showLoading({ title: '领取中...' })
    db.collection('favorite').doc(item._id).update({
      data: {
        judge: 1,
        sure: '已领取'
      }
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '领取成功！', icon: 'success' })
      
      // 更新本地数据
      let list = this.data.couponList
      list[index].claimed = true
      list[index].judge = 1
      this.setData({
        couponList: list,
        myCouponCount: this.data.myCouponCount + 1
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '领取失败', icon: 'error' })
    })
  },

  // 跳转到我的优惠券
  goMyCoupon() {
    wx.navigateTo({
      url: '/pages/my/mycoupon/mycoupon'
    })
  },

  onShareAppMessage() {
    return {
      title: '优惠券领取中心 - 美味不贵！',
    }
  }
})
