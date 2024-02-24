//此页面为总订单页面
const app = getApp()
Page({

  data: {
    Status: -1,
    searchKeyword: '',
    showSearchPanel: false,
    searchLoading: false,
    searchResults: [],
    selectedOrder: null,
    allOrderList: [],
  },

  // ======= 搜索相关方法 =======

  // 输入实时触发
  onSearchInput(e) {
    const value = e.detail.value
    this.setData({ searchKeyword: value })
    if (this._searchTimer) clearTimeout(this._searchTimer)
    if (!value || !value.trim()) {
      this.setData({ showSearchPanel: false, searchResults: [], searchLoading: false })
      return
    }
    this.setData({ showSearchPanel: true, searchLoading: true })
    // 400ms 防抖
    this._searchTimer = setTimeout(() => {
      this._doSearch(value.trim())
    }, 400)
  },

  // 输入框聚焦
  onSearchFocus() {
    if (this.data.searchKeyword && this.data.searchKeyword.trim()) {
      this.setData({ showSearchPanel: true })
    }
  },

  // 点击搜索按钮
  onSearchConfirm() {
    const keyword = this.data.searchKeyword
    if (!keyword || !keyword.trim()) return
    this.setData({ showSearchPanel: true, searchLoading: true })
    this._doSearch(keyword.trim())
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      showSearchPanel: false,
      searchResults: [],
      searchLoading: false,
      selectedOrder: null
    })
  },

  // 关闭搜索面板
  closeSearchPanel() {
    this.setData({ showSearchPanel: false })
  },

  // 核心搜索逻辑：从数据库查询全部状态的订单（不受状态tab限制）
  _doSearch(keyword) {
    const db = wx.cloud.database()
    const userInfo = wx.getStorageSync('UserInfo')
    if (!userInfo || !userInfo.number) {
      this.setData({ searchLoading: false, searchResults: [] })
      return
    }
    // 查询该用户的全部订单（不限制状态）
    db.collection('list').where({
      number: userInfo.number
    }).orderBy('pickupTime', 'desc').limit(100).get().then(res => {
      // 统一处理 Detail 字段
      res.data.forEach(order => {
        if (order.Detail) {
          if (typeof order.Detail === 'string') {
            try { order.Detail = JSON.parse(order.Detail); } catch(e) { order.Detail = []; }
          }
          if (!Array.isArray(order.Detail)) order.Detail = [order.Detail];
          order.Detail = order.Detail.map(item => {
            if (typeof item === 'string') {
              try { return JSON.parse(item); } catch(e) { return item; }
            }
            return item;
          });
        } else {
          order.Detail = [];
        }
      });
      // 多维度过滤
      const key = keyword.toLowerCase()
      const filtered = res.data.filter(order => {
        if (order._id && order._id.toLowerCase().indexOf(key) >= 0) return true
        if (order.number && (order.number + '').indexOf(key) >= 0) return true
        if (order.time && order.time.toLowerCase().indexOf(key) >= 0) return true
        if (order.pickupTime && order.pickupTime.toLowerCase().indexOf(key) >= 0) return true
        if (order.remark && order.remark.toLowerCase().indexOf(key) >= 0) return true
        if (order.qucanhao && (order.qucanhao + '').indexOf(key) >= 0) return true
        if (order.Detail && order.Detail.length > 0) {
          return order.Detail.some(d =>
            (d.dishname && d.dishname.toLowerCase().indexOf(key) >= 0) ||
            (d.StoreName && d.StoreName.toLowerCase().indexOf(key) >= 0)
          )
        }
        return false
      })
      // 生成菜品摘要
      filtered.forEach(order => {
        if (order.Detail && order.Detail.length > 0) {
          const names = order.Detail.map(d => d.dishname || '').filter(n => n)
          order._dishSummary = names.length > 2 ? names.slice(0, 2).join('、') + ' 等' + names.length + '件' : names.join('、')
        } else {
          order._dishSummary = '暂无菜品信息'
        }
      })
      this.setData({ searchResults: filtered, searchLoading: false })
    }).catch(err => {
      console.error('搜索失败', err)
      this.setData({ searchResults: [], searchLoading: false })
    })
  },

  // 点击搜索结果项，展开该订单详情
  onSearchResultTap(e) {
    const orderId = e.currentTarget.dataset.id
    const order = this.data.searchResults.find(o => o._id === orderId)
    if (order) {
      this.setData({
        selectedOrder: order,
        showSearchPanel: false
      })
    }
  },

  // 关闭搜索选中的订单详情
  closeSelectedOrder() {
    this.setData({ selectedOrder: null })
  },
  
  getOrderList() {
    if (app.globalData.userInfo) {
      wx.cloud.database().collection('list').where({
        number: this.data.UserInfo.number,
        Status: Number(this.data.Status)
      }).orderBy('pickupTime', 'desc').get().then(res => {
        console.log(res.data);

        // 将Detail字段统一处理为数组格式（兼容字符串、单对象、数组等多种格式）
        res.data.forEach(order => {
          if (order.Detail) {
            // 如果Detail是JSON字符串，先解析
            if (typeof order.Detail === 'string') {
              try {
                order.Detail = JSON.parse(order.Detail);
              } catch(e) {
                order.Detail = [];
              }
            }
            // 如果解析后是单个对象而非数组，包装为数组
            if (!Array.isArray(order.Detail)) {
              order.Detail = [order.Detail];
            }
            // 遍历数组中的每个元素，处理可能嵌套的JSON字符串
            order.Detail = order.Detail.map(item => {
              if (typeof item === 'string') {
                try { return JSON.parse(item); } catch(e) { return item; }
              }
              return item;
            });
          } else {
            order.Detail = [];
          }
        });
    
        // 创建一个空的字典或对象，用于存储每个店名的信息
        var shopInfo = {};
    
        // 遍历订单列表中的每个订单
        for (var i = 0; i < res.data.length; i++) {
          var order = res.data[i];
          var details = order.Detail;
    
          // 遍历订单中的每个菜品
          for (var j = 0; j < details.length; j++) {
            var item = details[j];
            var shopName = item.StoreName;
            var amount = item.price;
            var quantity = item.number;
    
            if (shopInfo.hasOwnProperty(shopName)) {
              // 如果字典中已经存在该店名的信息，进行累加
              shopInfo[shopName].amount += amount * quantity;
              shopInfo[shopName].quantity += quantity;
            } else {
              // 如果字典中不存在该店名的信息，创建新的键值对
              shopInfo[shopName] = {
                amount: amount * quantity,
                quantity: quantity
              };
            }
          }
        }
        
        // 更新数据，将店名和合计信息保存到orderList中
        var updatedOrderList = [];
    
        // 遍历订单列表中的每个订单
        for (var i = 0; i < res.data.length; i++) {
          var order = res.data[i];
          var details = order.Detail;
          var updatedDetails = [];
    
          // 遍历订单中的每个菜品
          for (var j = 0; j < details.length; j++) {
            var item = details[j];
            var shopName = item.StoreName;
    
            // 检查shopInfo中是否存在该店名的信息
            if (shopInfo.hasOwnProperty(shopName)) {
              // 如果存在，将合计信息保存到item中
              item.shopAmount = shopInfo[shopName].amount;
              item.shopQuantity = shopInfo[shopName].quantity;
    
              // 删除shopInfo中的该店名信息，避免重复显示
              delete shopInfo[shopName];
            }
    
            updatedDetails.push(item);
          }
    
          // 更新订单的菜品信息
          order.Detail = updatedDetails;
          updatedOrderList.push(order);
        }
    
        this.setData({
          orderList: updatedOrderList,
          allOrderList: updatedOrderList
        });
        console.log(this.data.orderList)
      });
    }
  },

  choosetype(e) {
    // console.log(e.currentTarget.dataset.type)
    let Status = e.currentTarget.dataset.type
    this.setData({
      Status
    })
    // console.log(this.data.Status)
    this.getOrderList()
  },

  navigateToOrders: function (e) {
    console.log(e);
    const id = e.currentTarget.dataset.id;
    const danhao = e.currentTarget.dataset.danhao; // 替换为您要传递的第二个参数的值
    wx.navigateTo({
      url: `/pages/cart/evaluation/evaluation?id=${id}&danhao=${danhao}`,
    });
  },

  // 再来一单：回到首页重新点餐
  navigateToCat() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  // 确认取餐：将订单状态从1（待取餐）改为2（待评价），并立即刷新
  confirmPickup(e) {
    const orderId = e.currentTarget.dataset.id
    if (!orderId) return
    wx.showModal({
      title: '确认取餐',
      content: '确认已取到餐品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          wx.cloud.database().collection('list').doc(orderId).update({
            data: {
              Status: 2  // 待取餐 → 待评价
            }
          }).then(() => {
            wx.hideLoading()
            wx.showToast({
              title: '取餐成功！',
              icon: 'success'
            })
            // 如果是从搜索结果详情中点击的，更新selectedOrder状态
            if (this.data.selectedOrder && this.data.selectedOrder._id === orderId) {
              this.setData({
                'selectedOrder.Status': 2
              })
            }
            // 立即刷新订单列表
            this.getOrderList()
          }).catch(err => {
            wx.hideLoading()
            console.error('确认取餐失败', err)
            wx.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  HurryUp() {
    wx.showToast({
      title: '已提醒商家，请耐心等待',
      icon: 'none'
    })
  },

  toAfterSales(e) {
    let key = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/cart/aftersales/aftersales?id=' + key,
    })
    console.log(e.currentTarget.dataset)
  },
  topay(e) {
    console.log(e.currentTarget.dataset.id)
    // 待支付订单：演示版未接入微信支付（原 re_pay 占位页已下线）
    wx.showModal({
      title: '提示',
      content: '演示版本暂未接入在线支付，请到档口线下支付',
      showCancel: false
    })
  },

  toCancel(e) {
    console.log(e.currentTarget.dataset.id)
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (modalRes) => {
        if (modalRes.confirm) {
          wx.cloud.database().collection('list')
            .where({
              _id: e.currentTarget.dataset.id
            })
            .get().then(result => {
              console.log(result)
              wx.cloud.database().collection('list')
                .doc(result.data[0]._id)
                .remove()
                .then(res => {
                  wx.showToast({
                    title: '取消成功',
                  })
                  // 取消成功后刷新列表
                  this.getOrderList()
                })
            })
        }
      }
    })
  },

  onLoad(options) {
    this.setData({
      UserInfo: wx.getStorageSync('UserInfo')
    })
    console.log(app.globalData.orderList)
    this.getOrderList()
  },  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      UserInfo: wx.getStorageSync('UserInfo')
    })
    console.log(app.globalData.orderList)
    if (app.globalData.userInfo) {
      wx.cloud.database().collection('list').where({
        number: this.data.UserInfo.number,
        Status: Number(this.data.Status)
      }).get().then(res => {
        console.log(res.data)
        // 将Detail字段统一处理为数组格式
        res.data.forEach(order => {
          if (order.Detail) {
            if (typeof order.Detail === 'string') {
              try { order.Detail = JSON.parse(order.Detail); } catch(e) { order.Detail = []; }
            }
            if (!Array.isArray(order.Detail)) {
              order.Detail = [order.Detail];
            }
            order.Detail = order.Detail.map(item => {
              if (typeof item === 'string') {
                try { return JSON.parse(item); } catch(e) { return item; }
              }
              return item;
            });
          } else {
            order.Detail = [];
          }
        });
        const newData = res.data
        this.setData({
          orderList: newData,
          allOrderList: newData
        })
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
      this.setData({
        orderList: null,
        allOrderList: []
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    if (app.globalData.userInfo) {
      wx.cloud.database().collection('list').where({
        number: this.data.UserInfo.number,
        Status: Number(this.data.Status)
      }).get().then(res => {
        console.log(res.data)
        // 将Detail字段统一处理为数组格式
        res.data.forEach(order => {
          if (order.Detail) {
            if (typeof order.Detail === 'string') {
              try { order.Detail = JSON.parse(order.Detail); } catch(e) { order.Detail = []; }
            }
            if (!Array.isArray(order.Detail)) {
              order.Detail = [order.Detail];
            }
            order.Detail = order.Detail.map(item => {
              if (typeof item === 'string') {
                try { return JSON.parse(item); } catch(e) { return item; }
              }
              return item;
            });
          } else {
            order.Detail = [];
          }
        });
        const newData = res.data
        this.setData({
          orderList: newData,
          allOrderList: newData
        })
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
      this.setData({
        orderList: null,
        allOrderList: []
      })
    }

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
