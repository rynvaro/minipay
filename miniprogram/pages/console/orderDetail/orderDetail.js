// miniprogram/pages/console/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxChecked: false,
    balanceChecked: false,
    coupon: {
      coupon: {
          value: 0
      }
    },
    order: {
      totalAmount: 0,
    },
    income7: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: 'loading...',
    })
    let thiz = this
    wx.cloud.callFunction({
      name:"getOrder",
      data: {
          orderId: options.id,
      },
      success(res) {
          console.log(res)
          thiz.setData({
            order: res.result.data,
            income7: res.result.data.income7,
            wxChecked: res.result.data.payType === 1,
            balanceChecked: res.result.data.payType === 2
          })
          wx.hideLoading()
      },
      fail: function(e) {
          console.log(e.errMsg)
          wx.hideLoading()
      }
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