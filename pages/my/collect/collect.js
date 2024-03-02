// pages/collect/collect.js
const db = wx.cloud.database()

Page({
  data: {
    dataObj: [],
    loaded: false
  },

  onLoad() {
    this.getData()
  },

  onShow() {
    this.getData()
  },

  // 获取收藏列表（从collect集合按用户手机号查询）
  getData() {
    const userInfo = wx.getStorageSync('UserInfo')
    const userNumber = userInfo && userInfo.number ? userInfo.number : ''
    wx.showLoading({ title: '加载中...' })
    db.collection('collect').where({
      number: userNumber  // 只查询当前用户的收藏
    }).get().then(res => {
      wx.hideLoading()
      this.setData({
        dataObj: res.data || [],
        loaded: true
      })
    }).catch(() => {
      wx.hideLoading()
      this.setData({ loaded: true })
    })
  },

  // 跳转到菜品详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({
        url: '/pages/index/GoodsDetails/GoodsDetails?id=' + id
      })
    }
  },

  // 取消收藏（真正从数据库删除）
  cancelCollect(e) {
    const collectId = e.currentTarget.dataset.collectid
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定取消收藏该菜品吗？',
      success: (res) => {
        if (res.confirm) {
          // 从数据库中删除收藏记录
          db.collection('collect').doc(collectId).remove().then(() => {
            let list = this.data.dataObj
            list.splice(index, 1)
            this.setData({ dataObj: list })
            wx.showToast({ title: '已取消收藏', icon: 'success' })
          }).catch(() => {
            wx.showToast({ title: '取消失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 去逛逛
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onPullDownRefresh() {
    this.getData()
    wx.stopPullDownRefresh()
  },

  onShareAppMessage() {
    return {
      title: '我的美食收藏夹'
    }
  }
})
