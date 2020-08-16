// miniprogram/pages/console/home/home.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {
      storeImage: '',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({
    //   data: JSON.parse(options.data)
    // })
    // console.log(this.data)
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

    
    let thiz = this

    wx.cloud.callFunction({
      name:"getInfo",
      data: {
        phone: app.globalData.phone,
      },
      success(res) {
        console.log(res)
        thiz.setData({
          data:res.result.data
        })
      },
      fail: function(e) {
        console.log(e.errMsg)
      }
    })

    // TODO 合并成一个函数
      wx.cloud.callFunction({
          name:"getStoreSettingInfo",
          data: {
            phone: app.globalData.phone,
          },
          success(res) {
              console.log(res)
              thiz.setData({
                storeImage: res.result.data.data.data.storeImage,
              })
              wx.setNavigationBarTitle({
                title: res.result.data.data.data.storeName,
              })
          },
          fail: function(e) {
            console.log(e.errMsg)
          }
      })
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

  },

  discount: function(){
    wx.navigateTo({
      url: '../discount/discount',
    })
  },

  financial: function(){
    wx.navigateTo({
      url: '../financial/financial',
    })
  },

  store: function(){
    wx.navigateTo({
      url: '../store/store',
    })
  },

  orders: function(){
    wx.navigateTo({
      url: '../orders/orders',
    })
  },

  events: function() {
    wx.showToast({
      title: '开发中',
    })
  },

  service: function() {
    wx.showToast({
      title: '开发中',
    })
  }


})