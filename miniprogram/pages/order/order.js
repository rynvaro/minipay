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
        order: {
            amount: 66.01,
            discount: 9.8,
            rebate: 2.3,
            realAmount:32.3,
            coupon: 3.9,
            totalAmount: 22.90,
        }
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