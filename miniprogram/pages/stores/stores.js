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

      vipLevel: 1,
      stores: [],
      hidden: false,
      // page
      pageSize: 10,
      currentPage: 1,
      hasNext: false,
      orderType: 1,
      isGeo: false,
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

      listStores(this,orderType,isGeo,this.data.pageSize,this.data.currentPage)
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
    let title = '附近商家'
    let storeType = 0
    let hidden = false
    if (options.storeType=="4") {
      title="食在上饶"
      storeType = 1
    }
    if (options.storeType=="5"){
        title="玩乐途游"
        storeType = 2
    }
    if (options.storeType == "6") {
      hidden = true
    }

    wx.setNavigationBarTitle({
      title: title,
    })

    this.setData({
      storeType: storeType, 
      vipLevel: app.globalData.viplevel, 
      hidden: hidden,
      point: {lat: app.globalData.location.latitude,lon: app.globalData.location.longitude},
    })
    wx.showLoading({
        title: 'loading...',
    })
    listStores(this,1,false,this.data.pageSize, this.data.currentPage)
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
    if (this.data.hasNext) {
      wx.showLoading({
        title: 'loading...',
      })
      listStores(this, this.data.orderType, this.data.isGeo, this.data.pageSize, this.data.currentPage)
    }
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
function listStores(thiz, orderType, isGeo, pageSize, currentPage){
  console.log("orderType: ", orderType)
  console.log("isGeo: ", isGeo)
  console.log("storeType: ", thiz.data.storeType)
  console.log("point: ", thiz.data.point)
  console.log("currentPage: ", currentPage)
  console.log("pageSize: ", pageSize)
  wx.cloud.callFunction({
      name:"zstores",
      data: {
          storeType: thiz.data.storeType,
          orderType: orderType,
          isGeo: isGeo,
          lat: thiz.data.point.lat,
          lon: thiz.data.point.lon,
          pageSize: pageSize,
          currentPage: currentPage,
      },
      success(res) {
          console.log(res)
          thiz.setData({
              stores: thiz.data.stores.concat(res.result.data),
              hasNext: res.result.hasNext, 
              currentPage: res.result.currentPage,
              orderType: res.result.orderType,
              isGeo: res.result.isGeo,
            })
          wx.hideLoading()
      },
      fail: function(e) {
          console.log(e.errMsg)
          wx.hideLoading()
      }
  })
}