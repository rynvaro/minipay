// miniprogram/pages/paysuccess/paysuccess.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        navBarHeight: app.globalData.navBarHeight,
        barBG: '#F56613;',
        orderId: '',
        paysucInfo: {}
    },

    back: function(e) {
        wx.switchTab({
          url: '../index/index',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({orderId: options.orderId})
        let orderId = options.orderId
        let thiz = this
        wx.showLoading({
          title: 'loading...',
        })
        wx.cloud.callFunction({
            name:"zgetpaysucinfo",
            data: {
                orderId: orderId
            },
            success(res) {
                console.log(res)
                thiz.setData({paysucInfo: res.result})
                wx.hideLoading()
            },
            fail: function(e) {
                console.log(e)
                wx.hideLoading()
            }
        })
    },

    seeOrder: function(e) {
        wx.redirectTo({
          url: '../orderDetail/orderDetail?id='+this.data.orderId+'&showmark=true',
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