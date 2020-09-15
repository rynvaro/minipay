// miniprogram/pages/search/search.js

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
    vipLevel: 1,
    q: '',
    point: {lat: 0, lon: 0},
    stores: [],
    hotSearchs: [],
    hisSearchs: [],
    hotShow: true,
  },

  search: function(e) {
    wx.showLoading({
      title: 'loading...',
    })
    let thiz = this
    wx.cloud.callFunction({
        name:"zdosearch",
        data: {
          q: thiz.data.q,
          lat: thiz.data.point.lat,
          lon: thiz.data.point.lon,
        },
        success(res) {
            wx.hideLoading()
            console.log(res)
            thiz.setData({stores: res.result.data, hotShow: false})
            thiz.onShow()
        },
        fail: function(e) {
          wx.hideLoading()
          console.log(e)
        }
    })
  },

  focus: function(e) {
    this.setData({hotShow: true})
  },

  setQ: function(e) {
    this.setData({q: e.detail.value})
  },

  selectHot: function(e) {
    this.setData({q: this.data.hotSearchs[e.currentTarget.dataset.index]})
  },

  selectHis: function(e) {
    this.setData({q: this.data.hisSearchs[e.currentTarget.dataset.index]})
  },

  store: function(e){
    wx.navigateTo({
      url: '../store/store?storeID=' + e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({vipLevel: app.globalData.viplevel, point: {lat: app.globalData.location.latitude,lon: app.globalData.location.longitude}})
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
        name:"zhotsearch",
        success(res) {
            wx.hideLoading()
            console.log(res)
            thiz.setData({hisSearchs: res.result.his, hotSearchs: res.result.hot})
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
