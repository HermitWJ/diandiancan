// pages/shop/shop.js
const db = wx.cloud.database()

Page({
  data: {
    inputValue: '',
    placeholder: '搜索全部菜品...',
    allGoods: [],
    filteredGoods: [],
    isLoading: true,
    showResult: false,
    categoryList: [],
    selectedCategory: '',
  },

  onLoad(options) {
    this.loadAllGoods()
  },

  // 加载全部菜品
  loadAllGoods() {
    this.setData({ isLoading: true })
    // 微信云数据库单次最多20条，需要分页拉取
    this._fetchAll('menu').then(allData => {
      // 提取分类
      let catMap = {}
      allData.forEach(item => {
        if (item.StoreName && !catMap[item.StoreName]) {
          catMap[item.StoreName] = true
        }
      })
      let categoryList = Object.keys(catMap)

      this.setData({
        allGoods: allData,
        filteredGoods: allData,
        categoryList: categoryList,
        isLoading: false,
        showResult: true
      })
    }).catch(() => {
      this.setData({ isLoading: false })
    })
  },

  // 分页拉取全部数据
  _fetchAll(collection) {
    return new Promise((resolve, reject) => {
      let allData = []
      const batchSize = 20
      const fetchBatch = (skip) => {
        db.collection(collection).skip(skip).limit(batchSize).get().then(res => {
          allData = allData.concat(res.data)
          if (res.data.length === batchSize) {
            fetchBatch(skip + batchSize)
          } else {
            resolve(allData)
          }
        }).catch(reject)
      }
      fetchBatch(0)
    })
  },

  // 输入事件 - 实时过滤
  handleInput(e) {
    const value = e.detail.value
    this.setData({ inputValue: value })
    this._filterGoods()
  },

  // 搜索确认
  handleConfirm() {
    this._filterGoods()
  },

  // 过滤菜品
  _filterGoods() {
    const keyword = this.data.inputValue.trim().toLowerCase()
    const category = this.data.selectedCategory
    let filtered = this.data.allGoods

    if (keyword) {
      filtered = filtered.filter(item =>
        (item.dishname && item.dishname.toLowerCase().indexOf(keyword) >= 0) ||
        (item.StoreName && item.StoreName.toLowerCase().indexOf(keyword) >= 0) ||
        (item.details && item.details.toLowerCase().indexOf(keyword) >= 0)
      )
    }

    if (category) {
      filtered = filtered.filter(item => item.StoreName === category)
    }

    this.setData({ filteredGoods: filtered, showResult: true })
  },

  // 清空输入
  handleDeleteClick() {
    this.setData({ inputValue: '' })
    this._filterGoods()
  },

  // 取消搜索
  handleTextbtnClick() {
    this.setData({ inputValue: '', selectedCategory: '' })
    this._filterGoods()
  },

  // 选择分类
  onCategoryTap(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({
      selectedCategory: this.data.selectedCategory === cat ? '' : cat
    })
    this._filterGoods()
  },

  // 跳转详情
  toDetails(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/GoodsDetails/GoodsDetails?id=' + id,
    })
  },

  onShow() {},
  onReady() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {
    this.loadAllGoods()
    wx.stopPullDownRefresh()
  },
  onReachBottom() {},
  onShareAppMessage() {}
})
