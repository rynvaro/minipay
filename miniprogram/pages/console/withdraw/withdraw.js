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
    phone: '',
    code: '',
    codeID: '',
    sendSMSClicked: false,
    seconds: 60,
    label: '获取验证码',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      phone: app.globalData.phone,
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
    wx.showLoading({
      title: 'loading...',
    })
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
            wx.hideLoading()
        },
        fail: function(e) {
          console.log(e.errMsg)
          wx.hideLoading()
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

    if (!this.data.code) {
      wx.showToast({
        title: '请输入验证码',
      })
      return
    }

    if (this.data.withdrawAmount<=0) {
      wx.showToast({
        title: '请输入提现金额',
      })
      return
    }

    let thiz = this

    wx.showLoading({
      title: '正在提交...',
    })

    var promise = new Promise(function (resolve, reject) {
        wx.cloud.callFunction({
            name:"validateCode",
            data: {
              code: thiz.data.code,
              codeID: thiz.data.codeID,
            },
            success(res) {
                console.log(res)
                resolve(true)
            },
            fail: function(e) {
              console.log(e.errMsg)
              resolve(false)
            }
        })
      });

      promise.then(function(validateOK){
        if (!validateOK) {
          wx.hideLoading()
          wx.showToast({
            title: '验证码错误',
          })
        } else {
            wx.cloud.callFunction({
              name:"submitWithdraw",
              data: {
                phone: app.globalData.phone,
                withdrawAmount: parseInt(thiz.data.withdrawAmount),
              },
              success(res) {
                  console.log(res)
                  wx.hideLoading()
                  wx.showToast({
                    title: '已提交',
                    success: function(){
                      setTimeout(function(){wx.navigateBack()},500)
                    }
                  })
              },
              fail: function(e) {
                console.log(e.errMsg)
                wx.hideLoading()
              }
            })
        }
      })

  },

  setCode: function(e) {
    this.setData({
      code: e.detail.value,
    })
  },

  sendSMS: function(e) {
    if (this.data.sendSMSClicked) {
      return 
    }
    this.setData({
      sendSMSClicked: true,
    })

    this.setData({
      label: this.data.seconds + '秒'
    });
    // 启动以1s为步长的倒计时
    var interval = setInterval(() => {
        countdown(this);
    }, 1000);
    // 停止倒计时
    setTimeout(function() {
        clearInterval(interval);
    }, this.data.seconds * 1000);

    wx.showLoading({
      title: '发送中...',
    })
    let thiz = this
    wx.cloud.callFunction({
      name:"sendSMS",
      data: {
        phone: app.globalData.phone,
      },
      success(res) {
        console.log(res)
        thiz.setData({
          codeID: res.result._id
        })
        wx.hideLoading()
        wx.showToast({
          title: '已发送',
        })
      },
      fail: function(e) {
        console.log(e.errMsg)
        wx.hideLoading()
      }
    })
  },
  
  nextStep: function(e){

    if (this.data.withdrawAmount<=0) {
      wx.showToast({
        title: '请输入提现金额',
      })
      return
    }

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

function countdown(that) {
  var seconds = that.data.seconds;
  var label = that.data.label;
  console.log(seconds)
  if (seconds <= 1) {
      label = '获取验证码';
      seconds = 60;
      that.setData({
          sendSMSClicked: false
      });
  } else {
      label = '（' + --seconds + '秒）'
  }
  that.setData({
      seconds: seconds,
      label: label
  });
}