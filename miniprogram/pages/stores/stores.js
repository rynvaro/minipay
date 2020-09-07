// miniprogram/pages/stores/stores.js

const tabColor = '#999999'
const tabColorSelected = '#EC9B76'
const tabFontSizeSelected = '35rpx'
const tabFontSize = '30rpx'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  
  data: {
      tabColors: [tabColorSelected,tabColor,tabColor,tabColor],
      tabFontSizes: [tabFontSizeSelected,tabFontSize,tabFontSize,tabFontSize],
      tabSelected: [true, false, false],
      currentTabIndex: 0,
      storeType: 1, // 店铺类型：1 餐饮 2 娱乐
      point: {lat: 0, lon: 0},

      vipLevel: 3,
      vipDiscount: 8,

      stores: []
  },

  search: function(e) {
    //   wx.showLoading({
    //       title: 'loading...',
    //   })
    //   listOrder(this,e.detail.value)
  },

  onTabClick: function(e) {
      wx.showLoading({
        title: 'loading...',
      })

      var index = e.currentTarget.dataset.id
      for (var i in  this.data.tabColors) {
          if (i == index) {
              this.data.tabColors[i] = tabColorSelected
              this.data.tabFontSizes[i] = tabFontSizeSelected
              this.data.tabSelected[i] = true
          } else {
              this.data.tabColors[i] = tabColor
              this.data.tabFontSizes[i] = tabFontSize
              this.data.tabSelected[i] = false
          }
      }
      this.setData({
          tabColors:this.data.tabColors,
          tabFontSizes: this.data.tabFontSizes,
          tabSelected: this.data.tabSelected,
          currentTabIndex: index,
      })

      let orderType = e.currentTarget.dataset.ordertype
      let isGeo = false
      if (orderType == 0) {
        isGeo = true
      }

      listStores(this,orderType,false,'',isGeo)
  },

  store: function(e){
    wx.navigateTo({
      url: '../store/store?storeID=' + e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({storeType: options.storeType})
    this.setData({point: {lat: app.globalData.location.latitude,lon: app.globalData.location.longitude}})
      wx.showLoading({
          title: 'loading...',
      })
      listStores(this,1,false,'',false)
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

/**
 * 
 * @param {*} thiz this
 * @param {*} orderType 排序类型：1 按照人气 2 按照时间 0 不排序
 * @param {*} isSearch  是否是搜索
 * @param {*} q   搜索关键字
 * @param {*} isGeo 是否是Geo
 */
function listStores(thiz, orderType, isSearch, q, isGeo){
  console.log("orderType: ",orderType)
  console.log("isSearch: ",isSearch)
  console.log("q: ",q)
  console.log("isGeo: ",isGeo)
  console.log("storeType: ",thiz.data.storeType)
  console.log("point: ",thiz.data.point)
  wx.cloud.callFunction({
      name:"zstores",
      data: {
          storeType: thiz.data.storeType,
          orderType: orderType,
          isSearch: isSearch,
          q: q,
          isGeo: isGeo,
          lat: thiz.data.point.lat,
          lon: thiz.data.point.lon,
      },
      success(res) {
          console.log(res)
          thiz.setData({stores: res.result.data, vipLevel: res.result.viplevel})
          wx.hideLoading()
      },
      fail: function(e) {
          console.log(e.errMsg)
          wx.hideLoading()
      }
  })
}