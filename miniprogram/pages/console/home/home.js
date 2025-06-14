// miniprogram/pages/console/home/home.js
import drawQrcode from '../../../utils/weapp.qrcode.min'
const app = getApp();
var action = '';
var moveY = 500;
var animation = animation = wx.createAnimation({
    transformOrigin: "50% 50%",
    duration: 400,
    timingFunction: "ease",
    delay: 0
})
animation.translateY(moveY + 'vh').step();
Page({

  /**
   * 页面的初始数据
   */
  
  data: {
    store: {},
    show: false,
    showContract: false,
    discount: -1,
  },

  setdiscount: function(e) {
    this.setData({discount: e.detail.value})
  },

  genContract: function(e) {
    if (this.data.discount == -1) {
      wx.showToast({
        title: '请输入折扣',
      })
      return
    }
    this.setData({showContract: false})
    wx.navigateTo({
      url: '../contract/contract?discount='+this.data.discount+'&type=template&approved=false',
    })
  },

  hidden: function(e) {
    this.setData({show: false})
  },

  contract: function(e) {
    if (this.data.store.approved) {
      wx.navigateTo({
        url: '../contract/contract?type=self&approved=true',
      })
      return
    }
    if (!this.data.store.complete) {
      wx.showModal({
        title: '提示',
        content: '请先在店铺设置板块完善个人信息。',
      })
      return
    }
    moveY = 0;
    action = 'show',
    animationEvents(this,moveY,action)
  },

  hiddenDiscount: function(e) {
      moveY = 500;
      action = 'hide';
      animationEvents(this,moveY,action)
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
    // if (!app.globalData.storeID) {
    //   wx.redirectTo({
    //     url: '../../console/index/index',
    //   })
    // }
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
console.log(app.globalData.storeID)
    wx.cloud.callFunction({
      name:"getInfo",
      data: {
        storeID: app.globalData.storeID,
      },
      success(res) {
        console.log(res)
        thiz.setData({
          store: res.result.data
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

  setPass: function() {
    wx.navigateTo({
      url: '../setpass/setpass',
    })
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

  toStore: function(){
    wx.navigateTo({
      url: '../store/store',
    })
  },

  orders: function(){
    wx.navigateTo({
      url: '../orders/orders',
    })
  },

  dayorders: function(e) {
    wx.navigateTo({
      url: '../orders/orders?type=day',
    })
  },

  events: function() {
    wx.showToast({
      title: '开发中',
    })
  },
})

function animationEvents(that, moveY, action){
  that.animation = wx.createAnimation({
    delay: 0,
    transformOrigin: "50% 50%",
    timingFunction: false,
    duration:400
  })

  that.animation.translateY(moveY + 'vh').step()
  if (action == 'show') {
    that.setData({
      animation: that.animation.export(),
      showContract: true,
    })
  } else if (action == 'hide') {
    that.setData({
      animation: that.animation.export(),
      showContract: false,
    })
  }
} 