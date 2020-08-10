// miniprogram/pages/search/search.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      bizs: [],
      registered: false,
      authorzied: false,
      dialog_class:'dialog-display-none',
      box_class: 'box',
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
      var that = this
      wx.cloud.callFunction({
        name:"list",
        data:{
          q: ''
        },
        success(res) {
          console.log(res.result.data)
          that.setData({
            bizs: res.result.data
          })
        },
        fail: console.error
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