// pages/randomeat1/randomeat1.js
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    menuList: [],         // 菜品列表
    result: null,         // 随机结果
    rolling: false,       // 是否正在滚动
    rollingItem: {},      // 滚动中显示的临时菜品
    historyList: [],      // 历史记录
    rollingTimer: null    // 滚动定时器
  },

  onLoad() {
    this.loadHistory()
    this.loadAllMenu()
  },

  onShow() {
    this.loadAllMenu()
  },

  // 加载全部菜品
  loadAllMenu() {
    wx.showLoading({ title: '加载中...' })
    db.collection('menu').limit(100).get().then(res => {
      wx.hideLoading()
      this.setData({ menuList: res.data })
    }).catch(() => {
      wx.hideLoading()
    })
  },

  // 开始随机
  startRandom() {
    if (this.data.rolling) return
    const list = this.data.menuList
    if (!list || list.length === 0) {
      wx.showToast({ title: '暂无可选菜品', icon: 'none' })
      return
    }

    this.setData({ rolling: true, result: null })

    // 滚动动画效果 - 快速切换菜品
    let count = 0
    const totalRolls = 15 + Math.floor(Math.random() * 10) // 15-25次滚动
    let interval = 80 // 初始间隔

    const roll = () => {
      if (count >= totalRolls) {
        // 滚动结束，确定最终结果
        const finalIndex = Math.floor(Math.random() * list.length)
        const finalResult = list[finalIndex]
        
        // 添加到历史记录
        let history = this.data.historyList
        history.unshift(finalResult)
        if (history.length > 10) history = history.slice(0, 10)

        this.setData({
          rolling: false,
          result: finalResult,
          historyList: history
        })
        this.saveHistory()

        // 震动反馈
        wx.vibrateShort({ type: 'heavy' })
        return
      }

      const randomIndex = Math.floor(Math.random() * list.length)
      this.setData({
        rollingItem: list[randomIndex]
      })

      // 轻微震动反馈
      if (count % 3 === 0) {
        wx.vibrateShort({ type: 'light' })
      }

      count++
      // 逐渐变慢
      if (count > totalRolls * 0.6) {
        interval += 30
      }
      if (count > totalRolls * 0.8) {
        interval += 50
      }

      setTimeout(roll, interval)
    }

    roll()
  },

  // 点击结果跳转详情页
  goDetail() {
    if (this.data.result && this.data.result._id) {
      wx.navigateTo({
        url: '/pages/index/GoodsDetails/GoodsDetails?id=' + this.data.result._id
      })
    }
  },

  // 点击历史记录跳转详情页
  goHistoryDetail(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.historyList[index]
    if (item && item._id) {
      wx.navigateTo({
        url: '/pages/index/GoodsDetails/GoodsDetails?id=' + item._id
      })
    }
  },

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('randomHistory') || []
    this.setData({ historyList: history })
  },

  // 保存历史记录
  saveHistory() {
    wx.setStorageSync('randomHistory', this.data.historyList)
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ historyList: [] })
          wx.removeStorageSync('randomHistory')
        }
      }
    })
  },

  onShareAppMessage() {
    if (this.data.result) {
      return {
        title: '命运选择了：' + this.data.result.dishname + '！来试试你的运气~',
      }
    }
    return {
      title: '今天吃什么？让命运来决定吧！',
    }
  }
})
