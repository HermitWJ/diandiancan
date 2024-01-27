//此页面为商品详情页面
const app = getApp()
Page({

  goBack() {
    wx.navigateBack({ delta: 1 })
  },

  toList() {
    // 立即下单：将当前单个商品写入临时storage，跳转到统一结算页
    let item = JSON.parse(JSON.stringify(this.data.item))
    item.number = 1
    wx.setStorageSync('direct_order', [item])
    let catId = this.data.catId || '2'
    wx.navigateTo({
      url: '/pages/index/settlement/settlement?mode=direct&catId=' + catId,
    })
  },

  toShopCart() {
    let item = this.data.item; // 获取当前商品信息
    item.number = 1; // 设置默认商品数量为1

    // 根据catId和用户ID隔离购物车数据
    let catId = this.data.catId || '2'
    const userInfo = wx.getStorageSync('UserInfo')
    const userId = userInfo && userInfo.number ? userInfo.number : 'guest'
    let cartKey = 'cart_' + userId + '_' + catId
    let moneyKey = 'totalmoney_' + userId + '_' + catId
  
    let cartList = wx.getStorageSync(cartKey) || []; // 获取当前餐厅的购物车数据
  
    // 检查购物车中是否已存在相同商品
    let existingItem = cartList.find(cartItem => cartItem._id === item._id);
  
    if (existingItem) {
      // 如果已存在相同商品，增加商品数量
      existingItem.number += 1;
    } else {
      // 如果不存在相同商品，将商品添加到购物车列表
      cartList.push(item);
    }
  
    wx.setStorageSync(cartKey, cartList); // 更新当前餐厅购物车缓存
  
    let totalMoney = wx.getStorageSync(moneyKey) || 0; // 获取当前餐厅的总金额
  
    totalMoney += item.price; // 增加商品价格到总金额
  
    wx.setStorageSync(moneyKey, totalMoney); // 更新总金额缓存
  
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      duration: 3000,
    });
  
    // 延迟0.5秒后返回餐厅页面
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 500);
  },

  collect() {
    const userInfo = wx.getStorageSync('UserInfo')
    const userNumber = userInfo && userInfo.number ? userInfo.number : ''
    if (!userNumber) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.cloud.database().collection('collect')
      .add({
        data: {
          cover: this.data.item.cover,
          dishname: this.data.item.dishname,
          price: this.data.item.price,
          id: this.data.item._id,
          number: userNumber  // 记录收藏用户的手机号
        }
      })
      .then(res => {
        console.log(res)
        this.getCollectStatus()
        wx.showToast({
          title: '收藏成功',
        })
      })
  },

  cancleCollect() {
    const userInfo = wx.getStorageSync('UserInfo')
    const userNumber = userInfo && userInfo.number ? userInfo.number : ''
    wx.cloud.database().collection('collect')
      .where({
        number: userNumber,  // 按用户手机号过滤
        id: this.data.item._id
      })
      .get().then(result => {
        console.log(result)
        if (result.data.length > 0) {
          wx.cloud.database().collection('collect')
            .doc(result.data[0]._id)
            .remove()
            .then(res => {
              this.getCollectStatus()
              wx.showToast({
                title: '取消成功',
              })
            })
        }
      })
  },

  //更新收藏状态
  getCollectStatus() {
    const userInfo = wx.getStorageSync('UserInfo')
    const userNumber = userInfo && userInfo.number ? userInfo.number : ''
    wx.cloud.database().collection('collect')
      .where({
        number: userNumber,  // 按用户手机号过滤
        id: this.data.item._id
      })
      .get().then(result => {
        if (result.data.length > 0) {
          this.setData({
            isCollect: true
          })
        }
        else {
          this.setData({
            isCollect: false
          })
        }
      })
  },

  previewImg: function (e) {
    const currentUrl = e.currentTarget.dataset.src;
    const { evaluate } = this.data;
  
    // 找到当前图片所属的评论对象
    const currentEvaluate = evaluate.find(item => item.src.includes(currentUrl));
  
    // 获取当前评论对象中的所有图片链接
    const urls = currentEvaluate.src;
  
    // 使用 wx.previewImage API 预览图片
    wx.previewImage({
      current: currentUrl, // 当前显示图片的 URL
      urls: urls // 当前评论中的所有图片链接
    });
  },

  data: {
    isCollect: false,
    catId: '2'  // 默认为第二餐厅，由跳转参数覆盖
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options.id)
    // 保存来源餐厅ID，用于购物车数据隔离
    if (options.catId) {
      this.setData({ catId: options.catId })
    }
    //可以在此页面通过options获取上一页传来的参数
    wx.cloud.database().collection('menu').doc(options.id).get()
      // 加入doc方法来确定所要操作的具体文档
      .then(res => {
        console.log(res)
        this.setData({
          item: res.data
        })
        console.log(this.data.item)
        //进行数据绑定
        this.getCollectStatus()
        //监听收藏动态
      })

    wx.cloud.database().collection('evaluate').where({
      goodsId: options.id
    }).get()
      .then(res => {
        console.log(res)
        // 计算平均评分
        let avgStar = 5;
        if (res.data.length > 0) {
          let totalStar = 0;
          res.data.forEach(item => {
            totalStar += (item.starCount || 5);
          });
          avgStar = (totalStar / res.data.length).toFixed(1);
        }
        this.setData({
          evaluate: res.data,
          avgStar: avgStar
        })
      })

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
    return {
      title: this.data.item.dishname,
      imageUrl: this.data.item.cover
    }
  }
})
