// pages/my/forget/mibao/mibao.js
Page({

    inputvalues1(e) {
        console.log(e.detail.value)
        let inputvalues1 = e.detail.value
        this.setData({
            inputvalues1
        })
    },

    inputvalues2(e) {
        console.log(e.detail.value)
        let inputvalues2 = e.detail.value
        this.setData({
            inputvalues2
        })
    },

    yanzheng(){
        wx.cloud.database().collection('confidential').where({
            answer1: this.data.inputvalues1,
            answer2: this.data.inputvalues2
          }).get().then(res => {
            console.log(res)
            if (res.data.length != 0) {
              console.log(res.data[0])
              wx.showToast({
                title: '验证成功',
                icon:'success',
                duration: 1200
              })
              // 等待提示显示完毕后再跳转页面
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/my/forget/re-password/re-password?id=' + this.data.number,
                })
              }, 1500)
            }
            else{
                wx.showToast({
                  title: '验证失败',
                  icon:'error'
                })
                return
            }
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
        wx.cloud.database().collection('confidential').where({
            number: wx.cloud.database().RegExp({
                regexp: options.id,
                options: 'i'
            })
        }).get().then(res => {
            console.log(res)
            this.setData({
                info: res.data
            })
            console.log(this.data.info)
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
