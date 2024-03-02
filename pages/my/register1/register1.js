// pages/my/register1/register1.js
Page({
    

    
    register(e) {
        console.log(e)
        let passinfo = e.detail.value
        this.setData({
            passinfo
        })
        if (!passinfo.question1 || !passinfo.answer1 || !passinfo.question2 || !passinfo.answer2) {
            wx.showToast({
                title: '请输入完整信息',
                icon: "error"
            })
            return;
        }
            else {
                this.addinfo()
            }
    },

    addinfo() {
        wx.cloud.database().collection('confidential').add({
            data: {
                number:this.data.number,
                question1: this.data.passinfo.question1,
                question2: this.data.passinfo.question2,
                answer1: this.data.passinfo.answer1,
                answer2: this.data.passinfo.answer2,
            }
        })
            .then(res => {
                console.log(res)
                wx.showToast({
                    title: '注册成功',
                    icon: 'success',
                    duration: 1500
                })
                // 等待提示显示完毕后再跳转页面
                setTimeout(() => {
                  wx.navigateTo({
                      url: '/pages/my/login/login',
                  })
                }, 1200)
            })
    },

    toLogin() {
        wx.navigateTo({
            url: '/pages/my/login/login',
        })
    },
    
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options.id)
    this.setData({
        number:options.id
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
