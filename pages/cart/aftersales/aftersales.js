// pages/aftersales/aftersales.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options.id)
    wx.cloud.database().collection('list').doc(options.id).get()
      .then(res => {
        console.log(res)
        // 将Detail中的JSON字符串反序列化为对象（兼容新旧数据格式）
        if (res.data.Detail && Array.isArray(res.data.Detail)) {
          res.data.Detail = res.data.Detail.map(item => {
            if (typeof item === 'string') {
              try { return JSON.parse(item); } catch(e) { return item; }
            }
            return item;
          });
        }
        this.setData({
          item: res.data
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

  }
})
