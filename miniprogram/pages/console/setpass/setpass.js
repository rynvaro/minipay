// miniprogram/pages/console/setpass/setpass.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        password: ''
    },

    setpass: function(e) {
        this.setData({password: e.detail.value})
    },

    doSetpass: function(e) {
        let thiz = this
        wx.showLoading({
          title: 'loading...',
        })
        wx.cloud.callFunction({
            name:"resetPassword",
            data: {
                password: thiz.data.password,
                storeID: app.globalData.storeID,
                type: 'setpass'
            },
            success(res) {
                console.log(res)
                wx.hideLoading()
                if (res.result == 1) {
                    wx.showModal({
                        title: '提示',
                        content: '设置成功',
                        success (res) {
                            wx.navigateBack({
                              delta: 0,
                            })
                        }
                    })
                }else {
                    wx.hideLoading()
                    wx.showToast({
                      title: '设置失败',
                    })
                }
            },
            fail: function(e) {
              console.log(e)
              wx.showToast({
                title: '设置失败',
              })
            }
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

    }
})