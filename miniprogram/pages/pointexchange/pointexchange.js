// miniprogram/pages/pointexchange/pointexchange.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiperCurrent: 0,//当前所在页面的 index
        indicatorDots: true, //是否显示面板指示点
        autoplay: true, //是否自动切换
        interval: 3000, //自动切换时间间隔,3s
        duration: 1000, //滑动动画时长1s
        circular: true, //是否采用衔接滑动
        bannerUrls: [],
        coupons: []
    },

    pointexchanging: function(e) {
        console.log(e)
        wx.navigateTo({
          url: '../pointexchanging/pointexchanging?coupon='+JSON.stringify(this.data.coupons[e.currentTarget.dataset.id-1]),
        })
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
              name:"zcoupons",
              success(res) {
                  wx.hideLoading()
                  console.log(res)
                  thiz.setData({
                      coupons: res.result.data[0].coupons,
                      bannerUrls: res.result.data[0].banners,
                  })
              },
              fail: function(e) {
                wx.hideLoading()
                console.log(e)
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