// miniprogram/pages/plates/plates.js
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        navBarHeight: app.globalData.navBarHeight,
        plate: {},
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
              name:"zplate",
              data: {
                plateID: options.plateID
              },
              success(res) {
                  wx.hideLoading()
                  console.log(res)
                  thiz.setData({
                      plate: res.result.data
                  })
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