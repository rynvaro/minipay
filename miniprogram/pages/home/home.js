// miniprogram/pages/home/home.js
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
    bannerUrls: [],
    
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    plates: [],
    events: [],
    eventshow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  search: function(e) {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  plates: function(e) {
    console.log(e)
    let to = e.currentTarget.dataset.to
    if (to == "1" || to == "2" || to == "3") {
      wx.navigateTo({
        url: '../plates/plates?plateID=' + e.currentTarget.dataset.id,
      })
    }else if (to == "4" || to == "5" || to == "6") {
      wx.navigateTo({
        url: '../stores/stores?storeType='+to,
      })
    }
  },

  stores: function(e) {
    wx.navigateTo({
      url: '../stores/stores?storeType='+e.currentTarget.dataset.id,
    })
  },

  store: function(e) {
    console.log(e)
    wx.navigateTo({
      url: '../store/store?storeID=' + e.currentTarget.dataset.id,
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
    let thiz = this
    wx.cloud.callFunction({
      name:"zevents",
      success(res) {
        console.log(res)
          let eventshow = false
          if (res.result.data.length > 0) {
            eventshow = true
          }
          thiz.setData({
              events: res.result.data,
              eventshow: eventshow
          })
      },
      fail: function(e) {
        console.log(e)
      }
    })
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        app.globalData.location = res
        wx.showLoading({
          title: 'loading...',
        })
        listPlates(thiz,res.latitude,res.longitude)
      },
      fail(res) {
        wx.showLoading({
          title: 'loading...',
        })
        listPlates(thiz,0,0)
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

function listPlates(thiz,lat,lng) {
  wx.cloud.callFunction({
    name:"zplates",
    data: {
      lat: lat,
      lon: lng,
      level: app.globalData.viplevel,
    },
    success(res) {
      console.log(res)
        wx.hideLoading()
        thiz.setData({
            plates: res.result.data,
        })
    },
    fail: function(e) {
      console.log(e)
      wx.hideLoading()
    }
  })
}