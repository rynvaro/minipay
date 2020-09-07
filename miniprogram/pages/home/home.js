// miniprogram/pages/home/home.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    plates: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        console.log(res)
        app.globalData.location = res
      }
    })
  },

  search: function(e) {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  plates: function(e) {
    wx.navigateTo({
      url: '../plates/plates?plateID=' + e.currentTarget.dataset.id,
    })
  },

  stores: function(e) {
    wx.navigateTo({
      url: '../stores/stores?storeType='+e.currentTarget.dataset.id,
    })
  },

  store: function(e) {
    console.log(e)
    wx.navigateTo({
      url: '../store/store?storeID=' + e.currentTarget.dataset.id,
    })
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
    wx.showLoading({
      title: 'loading...',
    })
    let thiz = this
    wx.cloud.callFunction({
        name:"zplates",
        success(res) {
            wx.hideLoading()
            console.log(res)
            thiz.setData({
                plates: res.result.data,
            })
        },
        fail: function(e) {
          wx.hideLoading()
          console.log(e)
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

  }
})