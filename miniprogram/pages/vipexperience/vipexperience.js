// miniprogram/pages/vipexperience/vipexperience.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        user: {},
        histories: [],
        tipsBoxHidden: true,
        statusBarHeight: app.globalData.statusBarHeight,
        navBarHeight: app.globalData.navBarHeight,
    },

    showTips: function(e){
        this.setData({tipsBoxHidden:false})
    },

    hideTips: function(e){
        this.setData({tipsBoxHidden:true})
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
                let user = res.result.data.data
                if (user.exp < 1000) {
                    user.expTotal = 1000
                  }else if (user.exp > 1000 && user.exp < 10000) {
                    user.expTotal = 1000
                  }
                thiz.setData({
                    user: user,
                })
            },
            fail: function(e) {
            wx.hideLoading()
            console.log(e)
            }
        })

        wx.cloud.callFunction({
            name:"zexprecords",
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