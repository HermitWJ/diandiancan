const app = getApp()
const { sha256 } = require('../../../utils/crypto')

Page({

  toRegister() {
    wx.navigateTo({
      url: '/pages/my/register/register',
    })
  },

  getAccount(e) {
    console.log(e.detail.value)
    this.setData({
      number: e.detail.value
    })
  },

  getCookAccount(e) {
    console.log(e.detail.value)
    this.setData({
      Account: e.detail.value
    })
  },

  getPassword(e) {
    console.log(e.detail.value)
    this.setData({
      password: e.detail.value
    })
  },

  getCookPassword(e) {
    console.log(e.detail.value)
    this.setData({
      Cookpassword: e.detail.value
    })
  },

  Login(e) {
    if (!this.data.number || !this.data.password) {
      wx.showToast({
        title: '请输入完整信息',
        icon: "error"
      })
      return;
    }
    else {
      wx.cloud.database().collection('User_Info').where({
        number: this.data.number,
        password: sha256(this.data.password)
      }).get().then(res => {
        console.log(res)
        if (res.data.length != 0) {
          //保存用户的信息至缓存
          console.log(res.data[0])
          wx.setStorageSync('UserInfo', res.data[0])
          app.globalData.userInfo = res.data[0]
          console.log(app.globalData.userInfo)
          //如果要跳转到tabbar界面，要使用switchTab
          // wx.navigateTo({
          //   url: '/pages/my/setup/setup',
          // })
          wx.switchTab({
            url: '/pages/index/index?studentID=' + this.data.studentID,
            success() {
              wx.showToast({
                title: '登录成功',
                icon: "success"
              })
              console.log(app.globalData.userInfo)
            }
          })
        }
        else {
          wx.showToast({
            title: '账号密码不一致',
            icon: "error"
          })
          return;
        }
      });
    }
  },

 forget(){
    wx.navigateTo({
      url: '/pages/my/forget/forget',
    })

 },

 choosetype(e) {
    // console.log(e.currentTarget.dataset.type)
    let Status = e.currentTarget.dataset.type
    this.setData({
        Status
    })
},

CookLogin(e){
    if (!this.data.Account || !this.data.Cookpassword) {
        wx.showToast({
          title: '请输入完整信息',
          icon: "error"
        })
        return;
      }
      else {
        wx.cloud.database().collection('Cook_Info').where({
          Account: this.data.Account,
          password: sha256(this.data.Cookpassword)
        }).get().then(res => {
          console.log(res)
          if (res.data.length != 0) {
            //保存用户的信息至缓存
            console.log(res.data[0])
            // wx.setStorageSync('UserInfo', res.data[0])
            // app.globalData.userInfo = res.data[0]
            // console.log(app.globalData.userInfo)
            //如果要跳转到tabbar界面，要使用switchTab
            // wx.navigateTo({
            //   url: '/pages/my/setup/setup',
            // })
            wx.navigateTo({
              url: '/pages/Cook/Cook?info=' + this.data.Account,
              success() {
                wx.showToast({
                  title: '登录成功',
                  icon: "success"
                })
                // console.log(app.globalData.userInfo)
              }
            })
          }
          else {
            wx.showToast({
              title: '账号密码不一致',
              icon: "error"
            })
            return;
          }
        });
      }
},

  data: {
    Status: -1,
    showPassword: false,
    showCookPassword: false,
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  toggleCookPassword() {
    this.setData({ showCookPassword: !this.data.showCookPassword })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //如果此处数值不为空（即缓存存在，则可实现自动登录）
    if (wx.getStorageSync('UserInfo')) {
      this.setData({
        UserInfo: wx.getStorageSync('UserInfo')
      })
      app.globalData.userInfo = this.data.UserInfo
      // console.log(app.globalData.userInfo)
      wx.switchTab({
        url: '/pages/index/index',
        success() {
          wx.showToast({
            title: '登录成功',
            icon: "success"
          })
        }
      })
    }
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
