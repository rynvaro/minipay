// miniprogram/pages/console/discount/discount.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      discount: 0,
      startTime: '',
      endTime: '',
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
            name:"discountInfo",
            data: {
              storeID: app.globalData.storeID,
            },
            success(res) {
                console.log(res)
                if (res.result == -1) {
                  wx.showToast({
                    title: '未设置',
                  })
                  return
                }
                thiz.setData({
                  discount: res.result.discount,
                  startTime: res.result.startTime,
                  endTime: res.result.endTime,
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