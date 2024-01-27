//此页面为提交订单页面
const app = getApp()
var randomUtil = require('../../../utils/randomUtil.js');

// 获取实时时间的函数（每次提交时重新获取，避免时间不准确）
function getCurrentTime() {
  const time = new Date();
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

Page({
  data: {
    orderList: [],
    totalAmount: 0,
    mode: 'cart',       // 'cart' = 购物车结算, 'direct' = 立即下单
    catId: '',
    isHiddMask: true,
    // 取餐时间相关
    showTimePicker: false,
    pickupTime: '',
    pickupTimeType: 'asap',
    timePickerValue: [0, 0, 0],
    timeHours: [],
    timeMinutes: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
    // 页面标题
    pageTitle: '确认订单'
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({ delta: 1 })
  },

  // 关闭优惠券蒙层
  closeMask() {
    this.setData({ isHiddMask: true })
  },
  // 打开优惠券蒙层
  openMask() {
    this.setData({ isHiddMask: false })
  },

  addList() {
    const time1 = getCurrentTime();
    let orderList = this.data.orderList;
    let mode = this.data.mode;

    wx.showModal({
      title: '确认支付',
      content: '订单金额 ¥' + this.data.totalAmount.toFixed(2) + '，确认支付？',
      confirmText: '支付',
      confirmColor: '#ff6b6b',
    })
    .then(res => {
      if (res.confirm) {
        let orderPromises = [];
        // 遍历订单列表，生成多个订单（按店铺分组）
        orderList.forEach(order => {
          var randomNum = randomUtil.generateUniqueRandomNumber();
          // 将Detail数组中的对象转为JSON字符串，以满足CMS字符串数组类型要求
          let detailStrArr = order.items.map(item => JSON.stringify(item));
          let promise = wx.cloud.database().collection('list').add({
            data: {
              Detail: detailStrArr,
              Status: 0,
              remark: this.data.remark || '',
              time: time1,
              qucanhao: randomNum,
              number: this.data.UserInfo.number,
              totalPrice: order.totalPrice,
              pickupTime: this.data.pickupTime || '尽快取餐',
              mode: mode  // 记录下单方式
            }
          });
          orderPromises.push(promise);
        });

        Promise.all(orderPromises)
          .then(() => {
            // 清除数据
            if (mode === 'cart') {
              // 购物车结算模式：清除当前用户的购物车数据
              const userInfo = wx.getStorageSync('UserInfo')
              const userId = userInfo && userInfo.number ? userInfo.number : 'guest'
              wx.removeStorage({ key: 'cart_' + userId });
              wx.removeStorage({ key: 'totalmoney_' + userId });
              let catId = this.data.catId;
              if (catId) {
                wx.removeStorage({ key: 'cart_' + userId + '_' + catId });
                wx.removeStorage({ key: 'totalmoney_' + userId + '_' + catId });
              }
            } else {
              // 立即下单模式：只清除临时下单数据
              wx.removeStorage({ key: 'direct_order' });
            }

            wx.showToast({
              title: '下单成功',
              icon: 'success',
              duration: 1200
            });
            // 等待提示显示完毕后再跳转页面
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/cart/cart',
              });
            }, 1500);
          })
          .catch(error => {
            console.error('添加订单失败：', error);
            wx.showToast({
              title: '下单失败',
              icon: 'error'
            });
          });
      } else {
        // 取消支付，返回上一页
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 500);
        wx.showToast({
          title: '已取消',
          icon: 'error'
        });
      }
    });
  },

  toRemark() {
    wx.navigateTo({
      url: '/pages/index/settlement/remark/remark',
    })
  },

  // ========== 取餐时间选择器 ==========
  initTimeOptions() {
    const now = new Date()
    let startHour = now.getHours()
    let startMin = now.getMinutes()
    startMin = Math.ceil(startMin / 5) * 5
    if (startMin >= 60) {
      startHour += 1
      startMin = 0
    }
    startMin += 30
    if (startMin >= 60) {
      startHour += 1
      startMin -= 60
    }

    const endHour = 22
    let hours = []
    for (let h = startHour; h <= endHour; h++) {
      hours.push(String(h).padStart(2, '0'))
    }
    if (hours.length === 0) {
      hours = [String(endHour).padStart(2, '0')]
    }

    const minStr = String(startMin).padStart(2, '0')
    let minIdx = this.data.timeMinutes.indexOf(minStr)
    if (minIdx < 0) minIdx = 0

    this.setData({
      timeHours: hours,
      timePickerValue: [0, 0, minIdx]
    })
  },

  openTimePicker() {
    this.initTimeOptions()
    this.setData({ showTimePicker: true })
  },

  closeTimePicker() {
    this.setData({ showTimePicker: false })
  },

  selectQuickTime(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ pickupTimeType: type })
    if (type === 'custom') {
      this.initTimeOptions()
    }
  },

  onTimePickerChange(e) {
    this.setData({ timePickerValue: e.detail.value })
  },

  confirmTimePicker() {
    if (this.data.pickupTimeType === 'asap') {
      this.setData({
        pickupTime: '尽快取餐',
        showTimePicker: false
      })
    } else {
      const val = this.data.timePickerValue
      const hour = this.data.timeHours[val[0]] || '12'
      const min = this.data.timeMinutes[val[2]] || '00'
      this.setData({
        pickupTime: '今天 ' + hour + ':' + min,
        showTimePicker: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let mode = options.mode || 'cart'
    let catId = options.catId || ''

    this.setData({
      UserInfo: wx.getStorageSync('UserInfo'),
      catId: catId,
      mode: mode,
      pageTitle: mode === 'direct' ? '确认下单' : '确认订单'
    });

    // 根据模式获取商品数据
    let itemList = []
    const userInfo = wx.getStorageSync('UserInfo')
    const userId = userInfo && userInfo.number ? userInfo.number : 'guest'
    if (mode === 'direct') {
      // 立即下单模式：从临时storage获取单个商品
      itemList = wx.getStorageSync('direct_order') || []
    } else {
      // 购物车结算模式：从cart storage获取当前用户的购物车数据
      itemList = wx.getStorageSync('cart_' + userId) || []
    }

    // 按档口（StoreName）分组
    let orders = {}
    let totalAmount = 0

    itemList.forEach(item => {
      let storeName = item.StoreName || '未知档口'
      if (orders[storeName]) {
        orders[storeName].items.push(item)
        orders[storeName].totalPrice += item.price * (item.number || 1)
      } else {
        orders[storeName] = {
          StoreName: storeName,
          items: [item],
          totalPrice: item.price * (item.number || 1)
        }
      }
      totalAmount += item.price * (item.number || 1)
    })

    let orderList = Object.values(orders)

    this.setData({
      orderList: orderList,
      totalAmount: totalAmount
    })

    // 备注通过remark页面的navigateBack + setData传递，无需在此处理
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})
