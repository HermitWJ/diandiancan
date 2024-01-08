// compoments/sidebar/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type:Array,
      value:[
        {name: '蛋包饭',id: 1},
        {name: '老街面馆',id: 2},
        {name: '巧嫂米粉螺狮粉',id: 3},
        {name: '自选水饺',id: 4},
      ]
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    current: -1
  },

  
  /**
   * 组件的方法列表
   */
  methods: {
    switch(e) {
      const {current} = e.currentTarget.dataset
      this.setData({
        current
      })
    this.triggerEvent('on-change',{index:current})
    }
  }
})