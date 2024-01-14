// pages/index/detail/detail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        item: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options.id)
        // 从slideshow集合获取轮播图对应数据
        wx.cloud.database().collection('slideshow').doc(options.id).get()
            .then(res => {
                console.log(res)
                this.setData({
                    item: res.data
                })
                // 设置页面标题
                if (res.data.title) {
                    wx.setNavigationBarTitle({
                        title: res.data.title
                    })
                }
            })
    },

    /**
     * 返回上一页
     */
    goBack() {
        wx.navigateBack({ delta: 1 })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '西安理工大学食堂美食攻略 🍜',
            path: '/pages/index/index',
            imageUrl: this.data.item.cover || ''
        }
    }
})
