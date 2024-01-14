// pages/index/search/search.js
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    inputValue: '',
    goods: [],
    isSearching: false,
    showResult: false,
    searchHistory: [],
    hotKeywords: ['麻辣烫', '盖浇饭', '黄焖鸡', '肉夹馍', '臊子面', '酸菜鱼', '手抓饭', '煎饼果子'],
  },

  onLoad(options) {
    wx.setNavigationBarTitle({ title: '搜索美食' })
    // 加载搜索历史
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })
  },

  // 输入事件 - 实时搜索（防抖）
  onInput(e) {
    const value = e.detail.value
    this.setData({ inputValue: value })

    // 清空定时器
    if (this._searchTimer) clearTimeout(this._searchTimer)

    if (!value.trim()) {
      this.setData({ goods: [], showResult: false, isSearching: false })
      return
    }

    // 300ms 防抖
    this._searchTimer = setTimeout(() => {
      this.doSearch(value)
    }, 300)
  },

  // 执行搜索
  doSearch(keyword) {
    if (!keyword || !keyword.trim()) return
    this.setData({ isSearching: true, showResult: true })

    db.collection('menu').where({
      dishname: db.RegExp({
        regexp: keyword.trim(),
        options: 'i'
      })
    }).limit(20).get().then(res => {
      this.setData({
        goods: res.data,
        isSearching: false
      })
    }).catch(() => {
      this.setData({ isSearching: false })
    })
  },

  // 确认搜索（回车/点击搜索）
  onConfirmSearch() {
    const value = this.data.inputValue.trim()
    if (!value) return
    this._saveHistory(value)
    this.doSearch(value)
  },

  // 保存搜索历史
  _saveHistory(keyword) {
    let history = this.data.searchHistory.filter(item => item !== keyword)
    history.unshift(keyword)
    if (history.length > 10) history = history.slice(0, 10)
    this.setData({ searchHistory: history })
    wx.setStorageSync('searchHistory', history)
  },

  // 点击搜索历史/热门关键词
  onTagTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ inputValue: keyword })
    this._saveHistory(keyword)
    this.doSearch(keyword)
  },

  // 清空搜索历史
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      confirmColor: '#ff6b35',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] })
          wx.removeStorageSync('searchHistory')
        }
      }
    })
  },

  // 清空输入框
  clearInput() {
    this.setData({ inputValue: '', goods: [], showResult: false })
  },

  // 跳转详情
  toDetails(event) {
    let key = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/GoodsDetails/GoodsDetails?id=' + key,
    })
  },

  onShow() {},
  onReady() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})
