// miniprogram/pages/console/contract/contract.js
var wxParse = require('../../../utils/wxParse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        opacity: 0,
        contract: '',
        approved: false,
    },

    approve: function(e) {
        wx.showLoading({
            title: '加载中...',
          })
          let thiz = this
          wx.cloud.callFunction({
              name: 'zapprove',
              data: {
                  contract: thiz.data.contract,
              },
              success: function(res) {
                  console.log(res)
                  wx.hideLoading()
                  wx.showModal({
                      title: '提示',
                      content: '成功签约',
                      success(res){
                        wx.navigateBack({
                          delta: 0,
                        })
                      }
                  })
              },
              fail: function(e) {
                  console.log(e)
                  wx.hideLoading()
                  wx.showToast({
                    title: '签约失败',
                  })
              }
          })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({approved: options.approved})
        wx.showLoading({
            title: '加载中...',
          })
          let thiz = this
          wx.cloud.callFunction({
              name: 'zcontract',
              data: {
                  discount: options.discount,
                  type: options.type,
              },
              success: function(res) {
                  console.log(res)
                  wxParse.wxParse('title','html',res.result,thiz,0)
                  thiz.setData({contract: res.result})
                  wx.hideLoading()
              },
              fail: function(e) {
                  console.log(e)
                  wx.hideLoading()
  
              }
          })
    },

    onPageScroll: function(e) {
        if (e.scrollTop >= 1000) {
            this.setData({opacity: 1})
        }else {
            this.setData({opacity: 0})
        }
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