// miniprogram/pages/store/store.js
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
        current: 0,
        bannerUrls: [],

      store: {},
      v1discount: 0,
      v2discount: 0,
      v3discount: 0,
      discount: 0,
      viplevel: 1,
    },

    videoEnded: function(e) {
      this.setData({autoplay: true, current: 1})
    },

    map: function(){
        wx.navigateTo({
          url: '../map/map?store='+JSON.stringify(this.data.store),
        })
    },

    order: function(){
        wx.navigateTo({
          url: '../order/order?merchantID='+this.data.store.phone
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
        name:"zgetstore",
        data: {
          storeID: options.storeID,
          merchantID: options.storeID,
        },
        success(res) {
            console.log(res)
            let autoPlay = true
            for (var i = 0;i < res.result.banners.length; i++) {
                if (res.result.banners[i].isVideo) {
                  autoPlay = false
                }
            }
            thiz.setData({
              autoplay: autoPlay,
              store: res.result.store,
              v1discount: res.result.v1discount,
              v2discount: res.result.v2discount,
              v3discount: res.result.v3discount,
              discount: res.result.discount,
              viplevel: res.result.viplevel,
              bannerUrls: res.result.banners,
            })
            wx.hideLoading()
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