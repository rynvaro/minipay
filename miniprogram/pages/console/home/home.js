// miniprogram/pages/console/home/home.js
import drawQrcode from '../../../utils/weapp.qrcode.min'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store: {},
    show: false,
  },

  hidden: function(e) {
    this.setData({show: false})
  },

  showQRCode: function(e)   {
    this.setData({show: true})
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'myQrcode',
      text: this.data.store._id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
      name:"getInfo",
      data: {
        storeID: app.globalData.storeID,
      },
      success(res) {
        console.log(res)
        thiz.setData({
          store:res.result.data
        })
        wx.hideLoading()
      },
      fail: function(e) {
        console.log(e)
        wx.hideLoading()
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
})