// 统一餐厅页面 - 通过catId区分不同餐厅，购物车数据按用户+餐厅隔离
const app = getApp()

// 获取当前用户ID，用于购物车数据隔离
function getUserId() {
  const userInfo = wx.getStorageSync('UserInfo')
  return userInfo && userInfo.number ? userInfo.number : 'guest'
}

// 餐厅配置信息
const CANTEEN_CONFIG = {
  '1': { name: '第一餐厅', desc: '家常菜·面食', image: '/images/res/c1.png', collection: 'menu' },
  '2': { name: '第二餐厅', desc: '麻辣烫·炒菜', image: '/images/res/c2.png', collection: 'menu' },
  '3': { name: '第三餐厅', desc: '快餐·盖饭', image: '/images/res/c3.png', collection: 'menu' },
  '4': { name: '第四餐厅', desc: '特色小吃', image: '/images/res/c4.png', collection: 'menu' },
  '5': { name: '第五餐厅', desc: '西餐·简餐', image: '/images/res/c5.png', collection: 'menu' },
  '6': { name: '民族餐厅', desc: '清真·民族风味', image: '/images/res/c6.png', collection: 'menu' }
}

Page({
  data: {
    catId: '',           // 当前餐厅ID
    canteenName: '',     // 餐厅名称
    canteenDesc: '',     // 餐厅描述
    canteenImage: '',    // 餐厅图片
    dangkou: [],         // 档口列表
    menu: [],            // 菜品列表（原始）
    filteredMenu: [],    // 过滤后的菜品列表
    cartList: [],        // 当前餐厅的购物车列表
    totalmoney: 0,       // 当前餐厅的总金额
    cartTotalCount: 0,   // 购物车总数量
    selectedStoreId: null, // 选中的档口
    isHiddMask: true,    // 购物车蒙层是否隐藏
    searchKey: '',       // 搜索关键词
  },

  // ========== 生命周期 ==========

  onLoad(options) {
    const catId = options.id || '1'
    const config = CANTEEN_CONFIG[catId] || CANTEEN_CONFIG['1']

    // 读取当前餐厅的购物车数据（按用户+餐厅ID隔离存储）
    const userId = getUserId()
    const cartKey = 'cart_' + userId + '_' + catId
    const moneyKey = 'totalmoney_' + userId + '_' + catId
    let cartList = wx.getStorageSync(cartKey) || []
    let totalmoney = wx.getStorageSync(moneyKey) || 0

    this.setData({
      catId: catId,
      canteenName: options.title || config.name,
      canteenDesc: config.desc,
      canteenImage: config.image,
      cartList: cartList,
      totalmoney: totalmoney,
      cartTotalCount: this.calcTotalCount(cartList)
    })

    this.getDangkou(catId)
    this.getMenuData(catId)
  },

  onReady() {
    wx.setNavigationBarTitle({
      title: this.data.canteenName
    })
  },

  onShow() {
    // 每次页面显示时重新读取当前用户+餐厅的购物车数据
    const userId = getUserId()
    const cartKey = 'cart_' + userId + '_' + this.data.catId
    const moneyKey = 'totalmoney_' + userId + '_' + this.data.catId
    let cartList = wx.getStorageSync(cartKey) || []
    let totalmoney = wx.getStorageSync(moneyKey) || 0

    this.setData({
      cartList: cartList,
      totalmoney: totalmoney,
      cartTotalCount: this.calcTotalCount(cartList)
    })
    // 同步菜品列表的number
    this.syncMenuWithCart()
  },

  // ========== 数据获取 ==========

  // 获取档口列表（按餐厅catId过滤）
  getDangkou(catId) {
    wx.cloud.database().collection('dangkou').where({
      catId: catId  // 按餐厅ID过滤档口
    }).get().then(res => {
      this.setData({
        dangkou: res.data
      })
    })
  },

  // 获取菜品数据（按餐厅catId过滤）
  getMenuData(catId) {
    let cartList = this.data.cartList
    wx.cloud.database().collection('menu').where({
      catId: catId  // 按餐厅ID过滤菜品
    }).get().then(res => {
      let list = res.data
      if (list && list.length > 0) {
        list.forEach(item => {
          if (cartList && cartList.length > 0) {
            var result = cartList.find(cart => cart._id == item._id)
            if (result) {
              item.number = result.number
            } else {
              item.number = 0
            }
          } else {
            item.number = 0
          }
        })
      }
      this.setData({
        menu: list,
        filteredMenu: list
      })
    })
  },

  // 同步菜品列表和购物车的数量
  syncMenuWithCart() {
    let menu = this.data.menu
    let cartList = this.data.cartList
    if (menu && menu.length > 0) {
      menu.forEach(item => {
        if (cartList && cartList.length > 0) {
          var result = cartList.find(cart => cart._id == item._id)
          item.number = result ? result.number : 0
        } else {
          item.number = 0
        }
      })
      this.setData({ menu: menu })
      this.filterMenu()
    }
  },

  // ========== 档口筛选 ==========

  selectStore(e) {
    const id = e.currentTarget.dataset.id || null
    this.setData({
      selectedStoreId: id
    })
    this.filterMenu()
  },

  // 过滤菜品
  filterMenu() {
    let menu = this.data.menu
    let selectedStoreId = this.data.selectedStoreId
    let searchKey = this.data.searchKey

    let filtered = menu.filter(item => {
      let storeMatch = !selectedStoreId || item.StoreName == selectedStoreId
      let searchMatch = !searchKey || (item.dishname && item.dishname.indexOf(searchKey) >= 0)
      return storeMatch && searchMatch
    })

    this.setData({
      filteredMenu: filtered
    })
  },

  // ========== 搜索功能 ==========

  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    })
    this.filterMenu()
  },

  onSearch() {
    this.filterMenu()
  },

  clearSearch() {
    this.setData({
      searchKey: ''
    })
    this.filterMenu()
  },

  // ========== 购物车操作（数据按餐厅隔离） ==========

  // 计算购物车总数量
  calcTotalCount(cartList) {
    let count = 0
    if (cartList && cartList.length > 0) {
      cartList.forEach(item => {
        count += (item.number || 0)
      })
    }
    return count
  },

  // 保存购物车到Storage（按用户+餐厅隔离）
  saveCart() {
    const userId = getUserId()
    const cartKey = 'cart_' + userId + '_' + this.data.catId
    const moneyKey = 'totalmoney_' + userId + '_' + this.data.catId
    wx.setStorageSync(cartKey, this.data.cartList)
    wx.setStorageSync(moneyKey, this.data.totalmoney)
  },

  // 加菜
  jia(e) {
    let id = e.currentTarget.dataset.id
    let menu = this.data.menu

    menu.forEach(item => {
      if (item._id == id) {
        item.number = (item.number || 0) + 1
        // 更新购物车
        if (this.data.cartList && this.data.cartList.length > 0) {
          var result = this.data.cartList.find(cart => cart._id == id)
          if (result) {
            result.number = item.number
          } else {
            this.data.cartList.push(item)
          }
        } else {
          this.data.cartList.push(item)
        }

        this.setData({
          totalmoney: this.data.totalmoney + item.price,
          menu: menu,
          cartList: this.data.cartList,
          cartTotalCount: this.calcTotalCount(this.data.cartList)
        })
      }
    })
    this.filterMenu()
    this.saveCart()
  },

  // 减菜
  jian(e) {
    let id = e.currentTarget.dataset.id
    let menu = this.data.menu

    menu.forEach(item => {
      if (item._id == id) {
        if (item.number > 0) {
          item.number -= 1
          if (this.data.cartList && this.data.cartList.length > 0) {
            var index = this.data.cartList.findIndex(cart => cart._id == id)
            if (index !== -1) {
              if (item.number === 0) {
                this.data.cartList.splice(index, 1)
              } else {
                this.data.cartList[index].number = item.number
              }
            }
          }
          this.setData({
            totalmoney: this.data.totalmoney - item.price,
            menu: menu,
            cartList: this.data.cartList,
            cartTotalCount: this.calcTotalCount(this.data.cartList)
          })
        } else {
          wx.showToast({
            title: '数量不能小于0',
            icon: 'error'
          })
        }
      }
    })
    this.filterMenu()
    this.saveCart()
  },

  // 清空购物车
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          let menu = this.data.menu
          menu.forEach(item => { item.number = 0 })
          this.setData({
            cartList: [],
            totalmoney: 0,
            cartTotalCount: 0,
            menu: menu,
            isHiddMask: true
          })
          this.filterMenu()
          this.saveCart()
        }
      }
    })
  },

  // ========== 购物车蒙层 ==========

  closeMask() {
    this.setData({ isHiddMask: true })
  },

  openMask() {
    if (this.data.cartList.length > 0) {
      this.setData({ isHiddMask: false })
    }
  },

  // ========== 页面跳转 ==========

  // 跳转到商品详情页
  toGoodsDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/GoodsDetails/GoodsDetails?id=' + id + '&catId=' + this.data.catId,
    })
  },

  // 去结算
  toSettlement() {
    if (this.data.cartList.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }
    // 结算前，将当前餐厅的购物车数据写入通用的cart key供结算页面使用
    const userId = getUserId()
    wx.setStorageSync('cart_' + userId, this.data.cartList)
    wx.setStorageSync('totalmoney_' + userId, this.data.totalmoney)
    wx.navigateTo({
      url: '/pages/index/settlement/settlement?catId=' + this.data.catId,
    })
  },

  // ========== 下拉刷新 ==========

  onPullDownRefresh() {
    this.getDangkou(this.data.catId)
    this.getMenuData(this.data.catId)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage() {
    return {
      title: this.data.canteenName + ' - 西理工预点餐',
    }
  }
})
