// miniprogram/pages/console/index/index.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: ''
  },

  resetPassword: function(e) {
    wx.navigateTo({
      url: '../modifyPassword/modifyPassword',
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

  setPhone: function(e) {
    this.setData({
      phone:  e.detail.value
    })
  },

  setPassword: function(e) {
    this.setData({
      password:  e.detail.value
    })
  },

  login: function(){

    if (!/^1[3456789]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号不合法',
      })
      return 
    }


    if (this.data.password.length < 6) {
      wx.showToast({
        title: '密码格式不正确',
      })
      return 
    }

    wx.showLoading({
      title: '登录中...',
    })

    let thiz = this

    wx.cloud.callFunction({
      name:"consoleLogin",
      data:{
        phone: thiz.data.phone,
        password: thiz.data.password
      },
      success(res) {
        wx.hideLoading()
          console.log(res)
          if (res.result == -1) {
            wx.showToast({
              title: '商户不存在',
            })
            return
          }
          if (res.result == -2) {
            wx.showToast({
              title: '密码错误',
            })
            return
          }
          app.globalData.storeID = res.result._id
          wx.navigateTo({
            url: '../home/home'
          })    
      },
      fail: function(e) {
        console.log(e.errMsg)
        wx.hideLoading()
        wx.showToast({
          title: '密码错误',
        })
      }
    })

  }
})