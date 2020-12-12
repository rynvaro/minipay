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
      fromorder: false,
      now: 0,
    },

    use: function(e){
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];

      for (var i = 0;i<this.data.icoupons.length;i++) {
        if (e.currentTarget.dataset.id==this.data.icoupons[i]._id){

          let totalAmount = parseFloat(prevPage.data.totalAmount)

          console.log(this.data.icoupons[i].coupon.man/100)
          console.log(totalAmount,this.data.icoupons[i].coupon.man/100)
          if (totalAmount < this.data.icoupons[i].coupon.man/100) {
            wx.showToast({
              title: '满'+this.data.icoupons[i].coupon.man/100+'可用',
            })
            return
          }

          prevPage.setData({coupon: this.data.icoupons[i], couponSelected: true})
          if (this.data.fromorder) {
            wx.navigateBack({
              delta: 0,
            })
          }else {
            wx.switchTab({
              url: '../home/home',
            })
          }
          
        }
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.setData({fromorder: options.fromorder})
      console.log(this)
        wx.showLoading({
            title: 'loading...',
          })
          let thiz = this
            wx.cloud.callFunction({
                name:"zicoupons",
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
      this.setData({now: new Date().getTime()})
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