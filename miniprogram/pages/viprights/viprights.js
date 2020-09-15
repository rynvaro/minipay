// miniprogram/pages/viprights/viprights.js
const defaultH = '300rpx'
const toggledH = '600rpx'
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        cards: [],
        level: 1,
        toggles: [false, false, false],
        cardHeights: [defaultH,defaultH,defaultH],
    },

    toggle: function(e) {
        let id = e.currentTarget.dataset.id
        for (var i in this.data.toggles) {
            if (i == id) {
                this.data.toggles[i] = true
            }else {
                this.data.toggles[i] = false
            }
        }
        for (var i in this.data.cardHeights) {
            if (i == id) {
                this.data.cardHeights[i] = toggledH
            }else {
                this.data.cardHeights[i] = defaultH
            }
        }
        this.setData({
            toggles: this.data.toggles,
            cardHeights: this.data.cardHeights,
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
        this.setData({level: app.globalData.viplevel})
        wx.showLoading({
            title: 'loading...',
          })
          let thiz = this
          wx.cloud.callFunction({
              name:"zviprights",
              success(res) {
                  wx.hideLoading()
                  console.log(res)
                  thiz.setData({
                      cards: res.result.data,
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