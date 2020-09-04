// miniprogram/pages/stores/stores.js

const tabColor = '#999999'
const tabColorSelected = '#EC9B76'
const tabFontSizeSelected = '35rpx'
const tabFontSize = '30rpx'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  
  data: {
      tabColors: [tabColorSelected,tabColor,tabColor,tabColor],
      tabFontSizes: [tabFontSizeSelected,tabFontSize,tabFontSize,tabFontSize],
      tabSelected: [true, false, false],
      currentTabIndex: 0,

      vipLevel: 3,
      vipDiscount: 8,

      stores: [
          {
              id: 0,
              storeName: "北京麦当劳",
              storeType: "美国菜",
              price: 23,
              distance: "1.8km",
              seTime: "22:00-23:00",
              productImage: '../../images/logo.png',
          },
          {
            id: 1,
            storeName: "北京麦当劳",
            storeType: "美国菜",
            price: 123,
            distance: "1.8km",
            seTime: "22:00-23:00",
            productImage: '../../images/logo.png',
        },
        {
            id: 2,
            storeName: "北京麦当劳",
            storeType: "美国菜",
            price: 2,
            distance: "1.6km",
            seTime: "22:00-23:00",
            productImage: '../../images/logo.png',
        },
        {
            id: 3,
            storeName: "北京麦当劳",
            storeType: "美国菜",
            price: 23.0,
            distance: "200m",
            seTime: "22:00-23:00",
            productImage: '../../images/logo.png',
        }
      ]
  },

  orderDetail: function(e) {
      wx.navigateTo({
          url: '../orderDetail/orderDetail?id='+e.currentTarget.dataset.id,
      })
  },

  search: function(e) {
    //   wx.showLoading({
    //       title: 'loading...',
    //   })
    //   listOrder(this,e.detail.value)
  },

  onTabClick: function(e) {
    //   wx.showLoading({
    //     title: 'loading...',
    //   })
      var index = e.currentTarget.dataset.id
      for (var i in  this.data.tabColors) {
          if (i == index) {
              this.data.tabColors[i] = tabColorSelected
              this.data.tabFontSizes[i] = tabFontSizeSelected
              this.data.tabSelected[i] = true
          } else {
              this.data.tabColors[i] = tabColor
              this.data.tabFontSizes[i] = tabFontSize
              this.data.tabSelected[i] = false
          }
      }
      this.setData({
          tabColors:this.data.tabColors,
          tabFontSizes: this.data.tabFontSizes,
          tabSelected: this.data.tabSelected,
          currentTabIndex: index,
      })

    //   listOrder(this,'')
  },

  store: function(){
    wx.navigateTo({
      url: '../store/store',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //   wx.showLoading({
    //       title: 'loading...',
    //   })
    //   listOrder(this,'')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

function listOrder(thiz, q){
  wx.cloud.callFunction({
      name:"orderList",
      data: {
          q: q,
          phone: app.globalData.phone,
          status: thiz.data.currentTabIndex,
      },
      success(res) {
          console.log(res)
          thiz.setData({orders: res.result.data})
          wx.hideLoading()
      },
      fail: function(e) {
          console.log(e.errMsg)
          wx.hideLoading()
      }
  })
}