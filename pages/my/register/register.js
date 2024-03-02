const { sha256 } = require('../../../utils/crypto')

Page({
    getimage(e) {
        console.log(e.detail.avatarUrl)
        this.setData({
            avatarUrl: e.detail.avatarUrl
        })
        wx.showLoading({
            title: '上传中',
        })
        wx.cloud.uploadFile({
            cloudPath: "wx_Cover/" + Math.random() + Date.now() + '.png',
            //通过此方法定义头像存储到云存储的位置，并且通过随机数+当前时间数字来保证每个图片名称不重复
            filePath: e.detail.avatarUrl
        })
            .then(res => {
                console.log(res)
                this.setData({
                    avatarUrl: res.fileID
                })
            })
        wx.hideLoading()
    },
    register(e) {
        console.log(e)
        let userinfo = e.detail.value
        this.setData({
            userinfo
        })
        if (!userinfo.name || !userinfo.nickname || !userinfo.number || !userinfo.password1 || !userinfo.password) {
            wx.showToast({
                title: '请输入完整信息',
                icon: "error"
            })
            return;
        }
        if (userinfo.password != userinfo.password1) {
            wx.showToast({
                title: '密码不一致',
                icon: "error"
            })
            return;
        }
        wx.cloud.database().collection('User_Info').where({
            number: userinfo.number
        }).get().then(res => {
            console.log(res)
            if (res.data.length != 0) {
                wx.showToast({
                    title: '该手机号已注册',
                    icon: "error"
                })
                return;
            }
            else {
                this.addinfo()
            }
        });
    },

    addinfo() {
        wx.cloud.database().collection('User_Info').add({
            data: {
                name: this.data.userinfo.name,
                nickname: this.data.userinfo.nickname,
                number: this.data.userinfo.number,
                password: sha256(this.data.userinfo.password),
                password1: sha256(this.data.userinfo.password1),
                avatarUrl: this.data.avatarUrl
            }
        })
            .then(res => {
                console.log(res)
                let key = this.data.userinfo.number
                wx.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 1500
                })
                // 等待提示显示完毕后再跳转页面
                setTimeout(() => {
                  wx.navigateTo({
                      url: '/pages/my/register1/register1?id=' + key,
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
        userInfo: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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
