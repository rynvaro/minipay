//index.js
const app = getApp();

Page({
  data: {
    show: false,
    user: {
      icon:'',
      name: '登录/注册',
      exp: 0,
      expTotal: 6000,
    }
  },

  onLoad: function() {
    
  },

  vipexperience: function(){
    wx.navigateTo({
      url: '../vipexperience/vipexperience',
    })
  },

  balance: function(){
    wx.navigateTo({
      url: '../balance/balance',
    })
  },

  coupon: function(){
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  },

  pointexchange: function(){
    wx.navigateTo({
      url: '../pointexchange/pointexchange',
    })
  },

  signin: function(){
    wx.navigateTo({
      url: '../signin/signin',
    })
  },

  orders: function(){
    wx.navigateTo({
      url: '../orders/orders',
    })
  },

  point: function(){
    wx.navigateTo({
      url: '../point/point',
    })
  },

  feedback: function(){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  },

  storeregister: function(){
    wx.navigateTo({
      url: '../storeregister/storeregister',
    })
  },

  service: function(e){
      this.setData({show:true})
  },

  hidden: function(e) {
    this.setData({show:false})
  },

})