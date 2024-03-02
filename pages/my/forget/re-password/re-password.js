const { sha256 } = require('../../../../utils/crypto')

Page({
    re_password() {
        if (this.data.inputvalues1 != this.data.inputvalues2) {
            wx.showToast({
                title: '两次密码不一致',
                icon: 'error'
            })
            return;
        }
        else {
            wx.cloud.database().collection('User_Info').where({
                number: this.data.number
            })
                .update({               //此方法为执行更新操作
                    data: {
                        password: sha256(this.data.inputvalues1),
                        password1: sha256(this.data.inputvalues2)
                    }
                })
                .then(res => {
                    console.log(res)
                    wx.removeStorage({
                        key: 'UserInfo',
                    })
                    wx.showToast({
                        title: '修改成功',
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
                .catch(err => {
                    console.error('修改失败', err)
                })
        }


    },

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

    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            number: options.id
        })
        console.log(this.data.number)
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
