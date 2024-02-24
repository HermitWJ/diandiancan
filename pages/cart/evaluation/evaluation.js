// 获取实时时间
const time = new Date();
const year = time.getFullYear();
const month = String(time.getMonth() + 1).padStart(2, '0');
const day = String(time.getDate()).padStart(2, '0');
const hours = String(time.getHours()).padStart(2, '0');
const minutes = String(time.getMinutes()).padStart(2, '0');
const seconds = String(time.getSeconds()).padStart(2, '0');
const time1 = `${year}-${month}-${day}`;

// 星级评分描述文本
const rateTexts = ['', '非常差', '较差', '一般', '满意', '非常满意'];

Page({
  data: {
    images: [],
    img: [],
    inputvalue: '',
    maxlength: 200,
    starCount: 5,
    rateText: '非常满意',
    isAnonymous: false,
    canSubmit: true,
    quickTags: [
      { text: '🍜 味道很棒', selected: false },
      { text: '⚡ 出餐快', selected: false },
      { text: '📦 包装精美', selected: false },
      { text: '💰 性价比高', selected: false },
      { text: '😊 服务态度好', selected: false },
      { text: '🔥 分量十足', selected: false },
    ]
  },

  // 星级评分点击
  onStarTap(e) {
    const star = e.currentTarget.dataset.star;
    this.setData({
      starCount: star,
      rateText: rateTexts[star]
    });
    this._checkCanSubmit();
  },

  // 快捷标签点击
  onTagTap(e) {
    const index = e.currentTarget.dataset.index;
    const tags = this.data.quickTags;
    tags[index].selected = !tags[index].selected;

    // 把选中的标签拼接到输入框
    let tagTexts = tags.filter(t => t.selected).map(t => t.text).join(' ');
    // 移除已有的标签文字，保留用户手动输入的内容
    let userInput = this.data.inputvalue;
    // 更新标签
    this.setData({
      quickTags: tags
    });
  },

  // 匿名评价切换
  onAnonymousChange(e) {
    this.setData({
      isAnonymous: e.detail.value
    });
  },

  // 检查是否可以提交
  _checkCanSubmit() {
    const canSubmit = this.data.starCount > 0;
    this.setData({ canSubmit });
  },

  // 选择图片 - 最多9张
  updateimg() {
    let that = this;
    const remainCount = 9 - that.data.img.length;
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      });
      return;
    }
    wx.chooseMedia({
      count: remainCount,
      sizeType: ['original', 'compressed'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success(res) {
        let imgPaths = that.data.img.slice();
        for (let i = 0; i < res.tempFiles.length; i++) {
          imgPaths.push(res.tempFiles[i].tempFilePath);
        }
        // 最多保留9张
        if (imgPaths.length > 9) {
          imgPaths = imgPaths.slice(0, 9);
          wx.showToast({
            title: '最多上传9张图片',
            icon: 'none'
          });
        }
        that.setData({
          img: imgPaths
        });
      },
    });
  },

  // 预览图片
  previewImg(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.img[index],
      urls: this.data.img,
      showmenu: true
    });
  },

  // 删除图片
  DeleteImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除这张图片吗？',
      cancelText: '取消',
      confirmText: '确定',
      confirmColor: '#ff6b35',
      success: res => {
        if (res.confirm) {
          this.data.img.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            img: this.data.img
          });
        }
      }
    });
  },

  // 提交评价到云数据库
  sendToCloud() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请先选择评分',
        icon: 'none'
      });
      return;
    }

    if (!this.data.inputvalue) {
      wx.showToast({
        title: '请填写评价内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发布中...',
    });

    let that = this;

    // 上传图片
    let uploadPromises = [];
    for (let i = 0; i < that.data.img.length; i++) {
      uploadPromises.push(
        wx.cloud.uploadFile({
          cloudPath: "wx_feedback/" + Math.random() + Date.now() + ".png",
          filePath: that.data.img[i],
        })
      );
    }

    Promise.all(uploadPromises)
      .then((results) => {
        let upImg = [];
        for (let i = 0; i < results.length; i++) {
          upImg.push(results[i].fileID);
        }

        // 提交到云数据库
        wx.cloud.database().collection("evaluate").add({
          data: {
            src: upImg,
            id: this.data.UserInfo._id,
            content: this.data.inputvalue,
            time: time1,
            goodsId: this.data.goodsId,
            cover: this.data.isAnonymous ? '/images/ava.png' : this.data.UserInfo.avatarUrl,
            nickname: this.data.isAnonymous ? '匿名用户' : this.data.UserInfo.nickname,
            starCount: this.data.starCount,
            isAnonymous: this.data.isAnonymous
          },
        });

        wx.hideLoading();

        // 更新订单状态
        wx.cloud.database().collection('list').doc(this.data.danhao)
          .update({
            data: {
              Status: 3
            }
          });

        wx.showToast({
          title: "发布成功",
          icon: "success",
          duration: 1200
        });
        // 等待提示显示完毕后再跳转页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/cart/cart',
          });
        }, 1500);
      })
      .catch((error) => {
        wx.hideLoading();
        console.error("上传失败：", error);
        wx.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        });
      });
  },

  // 输入评论内容
  getPinglun(e) {
    this.setData({
      inputvalue: e.detail.value
    });
    this._checkCanSubmit();
  },

  onLoad(options) {
    this.setData({
      UserInfo: wx.getStorageSync('UserInfo')
    });
    this.setData({
      goodsId: options.id,
      danhao: options.danhao
    });
    wx.cloud.database().collection('menu').where({
      _id: this.data.goodsId,
    }).get().then(res => {
      this.setData({
        orderList: res.data
      });
    });
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
});
