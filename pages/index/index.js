const app = getApp()

Page({
    data: {
        text1: '',
        greetingText: '你好，同学 👋',
        user: null,
        noticeList: [
            '🎉 新学期开学优惠，全场满20减3元！',
            '⏰ 各餐厅营业时间：早7:00-晚21:00',
            '👋 第二餐厅新增麻辣香锅窗口，欢迎品尝！',
            '🔔 系统维护通知：每周一凌晨2:00-4:00'
        ],
        resList: [
            { id: 1, name: '第一餐厅', image: '/images/res/c1.png', desc: '家常菜·面食' },
            { id: 2, name: '第二餐厅', image: '/images/res/c2.png', desc: '麻辣烫·炒菜' },
            { id: 3, name: '第三餐厅', image: '/images/res/c3.png', desc: '快餐·盖饭' },
            { id: 4, name: '第四餐厅', image: '/images/res/c4.png', desc: '特色小吃' },
            { id: 5, name: '第五餐厅', image: '/images/res/c5.png', desc: '西餐·简餐' },
            { id: 6, name: '民族餐厅', image: '/images/res/c6.png', desc: '清真·民族风味' }
        ],
        recommendList: [],
        rankingList: [],
    },

    onLoad: function (options) {
        this.setData({
            showBack: true,
            user: app.globalData.userInfo
        })
        this.setGreeting()
        this.getcloudData()
        this.getRecommendData()
        this.getRankingData()
    },

    onShow: function () {
        this.setGreeting()
        // 每次显示页面时同步最新的用户信息（与"我的"页面逻辑一致）
        this.setData({
            user: app.globalData.userInfo
        })
    },

    // 根据时间段设置问候语
    setGreeting() {
        const hour = new Date().getHours()
        let greetingText = ''
        if (hour >= 5 && hour < 9) {
            greetingText = '早上好 ☀️'
        } else if (hour >= 9 && hour < 11) {
            greetingText = '上午好 🌤️'
        } else if (hour >= 11 && hour < 13) {
            greetingText = '中午好 🍱'
        } else if (hour >= 13 && hour < 17) {
            greetingText = '下午好 ☕'
        } else if (hour >= 17 && hour < 19) {
            greetingText = '傍晚好 🌇'
        } else if (hour >= 19 && hour < 23) {
            greetingText = '晚上好 🌙'
        } else {
            greetingText = '夜深了 💤'
        }
        this.setData({ greetingText })
    },

    // 获取轮播图数据
    getcloudData() {
        wx.cloud.database().collection('slideshow').get().then(res => {
            console.log(res)
            this.setData({
                slideshow: res.data
            })
        })
    },

    // 获取推荐菜品数据
    getRecommendData() {
        // 从云数据库获取推荐菜品，如果没有则用默认数据
        wx.cloud.database().collection('menu').limit(5).get().then(res => {
            if (res.data && res.data.length > 0) {
                // 为每个项目添加默认价格和名称（如数据库中没有）
                const list = res.data.map((item, index) => ({
                    ...item,
                    name: item.name || ['招牌红烧肉', '鱼香肉丝', '宫保鸡丁', '番茄炒蛋', '酸辣土豆丝'][index] || '美味菜品',
                    price: item.price || (12 + index * 2).toFixed(2)
                }))
                this.setData({ recommendList: list })
            } else {
                // 默认推荐数据
                this.setData({
                    recommendList: [
                        { name: '招牌红烧肉', price: '18.00', cover: '/images/hsr.png' },
                        { name: '鱼香肉丝', price: '15.00', cover: '/images/2.jpg' },
                        { name: '宫保鸡丁', price: '16.00', cover: '/images/3.jpg' },
                    ]
                })
            }
        }).catch(() => {
            this.setData({
                recommendList: [
                    { name: '招牌红烧肉', price: '18.00', cover: '/images/hsr.png' },
                    { name: '鱼香肉丝', price: '15.00', cover: '/images/2.jpg' },
                    { name: '宫保鸡丁', price: '16.00', cover: '/images/3.jpg' },
                ]
            })
        })
    },

    // 获取排行榜数据
    getRankingData() {
        // 默认排行数据
        this.setData({
            rankingList: [
                { name: '鸡排蛋包饭', price: '22.00', restaurant: '第二餐厅', sales: 368, cover: '/images/1.jpg' },
                { name: '黄焖鸡米饭', price: '16.00', restaurant: '第一餐厅', sales: 295, cover: '/images/2.jpg' },
                { name: '手工饺子', price: '19.00', restaurant: '第三餐厅', sales: 256, cover: '/images/3.jpg' },
            ]
        })
    },

    // 跳转详情页面
    toDetail(event) {
        let key = event.currentTarget.dataset.id
        if (key) {
            wx.navigateTo({
                url: '/pages/index/detail/detail?id=' + key,
            })
        }
    },

    toSearch() {
        wx.navigateTo({
            url: '/pages/index/search/search',
        })
    },

    // 快捷入口跳转
    goToRandomEat() {
        wx.navigateTo({
            url: '/pages/my/randomeat1/randomeat1',
        })
    },

    goToCoupon() {
        wx.navigateTo({
            url: '/pages/my/mycoupon/mycoupon',
        })
    },

    goToCollect() {
        wx.navigateTo({
            url: '/pages/my/collect/collect',
        })
    },

    goToOrder() {
        wx.switchTab({
            url: '/pages/cart/cart',
        })
    },

    goToMy() {
        wx.switchTab({
            url: '/pages/my/my',
        })
    },

    close() {
        this.setData({
            showBack: false
        })
    }
})
