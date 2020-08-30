// miniprogram/pages/order/order.js
var action = 'show';
var moveY = 200;
var animation = animation = wx.createAnimation({
    transformOrigin: "50% 50%",
    duration: 400,
    timingFunction: "ease",
    delay: 0
})
animation.translateY(moveY + 'vh').step();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        payAmount: 0,
        preOrder: {
          realDiscount: 0.00,
          rebate: 0.00,
          realAmount: 0.0,
        },

        couponSelected: false,
        coupon: {},
        merchantID: '',
    },

    select: function() {
      wx.navigateTo({
        url: '../coupon/coupon',
      })
    },

    inputChange: function(e) {
      if (e.detail.length==6) {
        wx.showLoading({
          title: 'loading...',
        })
        let thiz = this
      wx.cloud.callFunction({
          name:"zdorderpay",
          data: {
            merchantID: thiz.data.merchantID,
            storeID: thiz.data.merchantID,
            payAmount: thiz.data.payAmount,
            couponID: thiz.data.couponSelected ? thiz.data.coupon._id : -1,
            password: e.detail,
          },
          success(res) {
              console.log(res)
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '支付成功',
                success (res) {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }
              })
          },
          fail: function(e) {
            console.log(e.errMsg)
            wx.hideLoading()
          }
      })
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.setData({payAmount: parseFloat(options.payAmount),merchantID: options.merchantID})
      wx.showLoading({
        title: 'loading...',
      })
      let thiz = this
      
      wx.cloud.callFunction({
          name:"zrebuildorder",
          data: {
            merchantID: options.merchantID,
            storeID: options.merchantID,
            payAmount: thiz.data.payAmount,
          },
          success(res) {
              console.log(res)
              thiz.setData({preOrder: res.result.data})
              wx.hideLoading()
          },
          fail: function(e) {
            console.log(e.errMsg)
            wx.hideLoading()
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
    onShow: function (e) {
      if (this.data.couponSelected) {
        this.data.preOrder.totalAmount = this.data.preOrder.totalAmount-this.data.coupon.coupon.value/100
        this.setData({preOrder: this.data.preOrder})
      }
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

    },

    pay: function(e){
          moveY = 0;
          action = 'show',
          animationEvents(this,moveY,action)
      },
    
      hidden: function(e) {
        moveY = 200;
        action = 'hide';
        animationEvents(this,moveY,action)
      }
})

function animationEvents(that, moveY, action){
    that.animation = wx.createAnimation({
      delay: 0,
      transformOrigin: "50% 50%",
      timingFunction: false,
      duration:400
    })
  
    that.animation.translateY(moveY + 'vh').step()
    if (action == 'show') {
      that.setData({
        animation: that.animation.export(),
        show: true,
      })
    } else if (action == 'hide') {
      that.setData({
        animation: that.animation.export(),
        show: false,
      })
    }
  } 