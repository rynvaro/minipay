// miniprogram/pages/store/store.js
const app = getApp()
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
      if (!app.globalData.viplevel) {
        wx.showModal({
          title: '提示',
          content: '请先在首页授权登录',
          success (rr) {
            if (rr.confirm) {
              wx.switchTab({
                url: '../index/index',
              })
            } else if (rr.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        return
      }
        wx.navigateTo({
          url: '../order/order?storeID='+this.data.store._id
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      wx.showLoading({
        title: 'loading...',
        mask: true,
      })
      let thiz = this
      wx.cloud.callFunction({
        name:"zgetstore",
        data: {
          storeID: options.storeID,
        },
        success(res) {
            console.log(res)

            let store = res.result.data
            let autoPlay = true
            for (var i = 0;i < store.banners.length; i++) {
                if (store.banners[i].isVideo) {
                  autoPlay = false
                }
            }

            let v1discount = store.discount
            let v2discount = store.discount
            let v3discount = store.discount
            if (store.discount <=9 ) {
              v1discount = (store.discount + 0.5).toFixed(2)
              v2discount = (store.discount + 0.3).toFixed(2)
            }

            thiz.setData({
              autoplay: autoPlay,
              store: store,
              v1discount: v1discount,
              v2discount: v2discount,
              v3discount: v3discount,
              viplevel: app.globalData.viplevel,
              bannerUrls: store.banners,
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