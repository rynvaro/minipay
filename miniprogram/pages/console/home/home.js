// miniprogram/pages/console/home/home.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 组件参数设置，传递到组件
    defaultData: {
      title: "商家后台", // 导航栏标题
    }
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
  }


})