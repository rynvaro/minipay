// miniprogram/pages/console/withdraw/withdraw.js
const app = getApp();
var action = '';
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
    show: false,
    animation: animation,
    balance: 0,
    withdrawAmount: 0,
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
    let thiz = this
        wx.cloud.callFunction({
            name:"getInfo",
            data: {
              phone: app.globalData.phone,
            },
            success(res) {
                console.log(res)
                thiz.setData({
                    balance: res.result.data.balance
                })
            },
            fail: function(e) {
              console.log(e.errMsg)
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

  },

  setWithdrawAmount: function(e) {
    this.setData({
      withdrawAmount: e.detail.value
    })
  },

  submitWithdraw: function(e) {

    if (this.data.withdrawAmount<=0) {
      wx.showToast({
        title: '请输入提现金额',
      })
      return
    }

    let thiz = this

    wx.cloud.callFunction({
        name:"submitWithdraw",
        data: {
          phone: app.globalData.phone,
          withdrawAmount: parseInt(thiz.data.withdrawAmount),
        },
        success(res) {
            console.log(res)
            wx.showToast({
              title: '提现申请已提交',
              success: function(){
                setTimeout(function(){wx.navigateBack()},1000)
              }
            })
        },
        fail: function(e) {
          console.log(e.errMsg)
        }
    })

  },
  
  nextStep: function(e){

    if (this.data.withdrawAmount>this.data.balance) {
      wx.showToast({
        title: '余额不足',
      })
      return
    }

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