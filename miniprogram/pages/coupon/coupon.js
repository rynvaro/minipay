// miniprogram/pages/coupon/coupon.js

const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      statusBarHeight: app.globalData.statusBarHeight,
      navBarHeight: app.globalData.navBarHeight,
      icoupons: [],
    },

    use: function(e){
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];

      for (var i = 0;i<this.data.icoupons.length;i++) {
        if (e.currentTarget.dataset.id==this.data.icoupons[i]._id){

          let totalAmount = parseFloat(prevPage.data.realAmount)
          let couponValue = this.data.icoupons[i].coupon.value/100
          if (couponValue < totalAmount) {
            totalAmount = totalAmount - couponValue
          }
          totalAmount = (totalAmount + prevPage.data.mustPayment).toFixed(2)

          prevPage.setData({coupon: this.data.icoupons[i], couponSelected: true, totalAmount: totalAmount})
          wx.navigateBack({
            delta: 0,
          })
        }
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(this)
        wx.showLoading({
            title: 'loading...',
          })
          let thiz = this
            wx.cloud.callFunction({
                name:"zicoupons",
                data: {
                  value: options.value,
                },
                success(res) {
                    wx.hideLoading()
                    console.log(res)
                    thiz.setData({icoupons: res.result.data})
                },
                fail: function(e) {
                  wx.hideLoading()
                  console.log(e)
                }
            })
    },

    back: function(e) {
      wx.navigateBack({
        delta: 0,
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