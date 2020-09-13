// miniprogram/pages/map/map.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      store: {},
      markers: [],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      let store = JSON.parse(options.store)
      let marker  = {
        latitude: store.latitude,
        longitude: store.longitude,
      }
      this.setData({store: store,markers: [marker]})
    },

    searchRoad: function(e) {
      let thiz = this
      wx.getLocation({
        type: 'wgs84',
        success (res) {
          wx.openLocation({
            latitude: thiz.data.markers[0].latitude,
            longitude: thiz.data.markers[0].longitude,
            name: thiz.data.store.storeName,
            address: thiz.data.store.address,
          })
          // console.log(res)
          // let pointFrom = {
          //   longitude: res.longitude,
          //   latitude: res.latitude
          // }
          // let pointTo = {
          //   longitude: thiz.data.markers[0].longitude,
          //   latitude: thiz.data.markers[0].latitude
          // }
          // thiz.setData({
          //   polyline: [
          //     {
          //       points: [pointFrom,pointTo],
          //       color: "#FF0000DD",
          //       width: 2
          //     }
          //   ]
          // })
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