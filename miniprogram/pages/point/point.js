// miniprogram/pages/point/point.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        navBarHeight: app.globalData.navBarHeight,
        tipsBoxHidden: true,
        user: {},
        histories: [],
        barBG: 'transparent',
    },

    showTips: function(e){
        this.setData({tipsBoxHidden:false})
    },

    hideTips: function(e){
        this.setData({tipsBoxHidden:true})
    },

    onPageScroll: function(e) {
        if (e.scrollTop >= 145) {
            this.setData({barBG: '#FF7513'})
        }else {
            this.setData({barBG: 'transparent'})
        }
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

        wx.cloud.callFunction({
            name:"zpointrecords",
            success(res) {
                wx.hideLoading()
                console.log(res)
                thiz.setData({
                    histories: res.result.data,
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