// miniprogram/pages/balance/balance.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      user:{
        balance: 0,
      }
    },

    deposit: function() {
        wx.navigateTo({
          url: '../deposit/deposit',
        })
    },

    accountdetailed: function() {
        wx.navigateTo({
          url: '../accountdetailed/accountdetailed',
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
          name:"zgetuserinfo",
          success(res) {
              wx.hideLoading()
              console.log(res)
              thiz.setData({
                  user: res.result.data.data,
              })
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