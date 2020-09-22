// miniprogram/pages/deposit/deposit.js
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
    depositAmount: 0,
    phone: '点击获取手机号',
    phoned: false,
    code: '',
    codeID: '',
    sendSMSClicked: false,
    seconds: 60,
    label: '获取验证码',
  },

  getPhoneNumber: function(e){
    console.log(e)
    if (!e.detail.cloudID) {
      return
    }
    wx.showLoading({
      title: 'loading...',
    })
    let thiz = this
    wx.cloud.callFunction({
        name:"zgetphonenum",
        data: {
          phoneData: wx.cloud.CloudID(e.detail.cloudID),
        },
        success(res) {
            console.log(res)
            thiz.setData({
              phone: res.result.phoneData.data.phoneNumber,
              phoned: true,
            })
            wx.hideLoading()
        },
        fail: function(e) {
          console.log(e)
          wx.hideLoading()
        }
    })
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
    // wx.showLoading({
    //   title: 'loading...',
    // })
    // let thiz = this
    // wx.cloud.callFunction({
    //     name:"getInfo",
    //     data: {
    //       phone: app.globalData.phone,
    //     },
    //     success(res) {
    //         console.log(res)
    //         thiz.setData({
    //             balance: res.result.data.balance
    //         })
    //         wx.hideLoading()
    //     },
    //     fail: function(e) {
    //       console.log(e.errMsg)
    //       wx.hideLoading()
    //     }
    // })
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

  setDepositAmount: function(e) {
    this.setData({
      depositAmount: e.detail.value
    })
  },

  submitDeposit: function(e) {

    // if (!this.data.code) {
    //   wx.showToast({
    //     title: '请输入验证码',
    //   })
    //   return
    // }

    console.log(parseFloat(this.data.depositAmount))


    if (this.data.depositAmount<=0) {
      wx.showToast({
        title: '请输入充值金额',
      })
      return
    }

    let thiz = this

    wx.showLoading({
      title: '正在提交...',
    })

    /**
     * 1. 验证码
     * 2. 预下单，获取payment
     * 3. 调用requestPayment
     * 4. 等待支付结果确认
     * 5. 支付反馈
     */

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
              // 先不加验证码
              resolve(true) // TODO maybe we should not use code
            }
        })
      });

      promise = promise.then(function(validateOK){
        if (!validateOK) {
          wx.hideLoading()
          wx.showToast({
            title: '验证码错误',
          })
        } else {
            wx.cloud.callFunction({
              name:"zgetpayinfo",
              data: {
                ip: '127.0.0.1', // TODO
                depositAmount: parseFloat(thiz.data.depositAmount),
                body: "柒号生活-充值",
              },
              success(payInfoRes) {
                  console.log("pay info is: ",payInfoRes)
                  wx.hideLoading()

                  //
                  wx.requestPayment({
                      timeStamp: payInfoRes.result.res.payment.timeStamp,
                      nonceStr: payInfoRes.result.res.payment.nonceStr,
                      signType: payInfoRes.result.res.payment.signType,
                      paySign: payInfoRes.result.res.payment.paySign,
                      package: payInfoRes.result.res.payment.package,
                      success (payRes) { 
                        console.log(payRes)
                        // 1. 确认充值结果 TODO
                        // 2. 更新balance
                        wx.showLoading({
                          title: '充值中...',
                        })
                        wx.cloud.callFunction({
                          name:"zupdatebalance",
                          data: {
                            depositID: payInfoRes.result.deposit._id,
                          },
                          success(res) {
                              console.log(res)
                              wx.hideLoading()
                              wx.navigateBack({
                                delta: 0,
                              })
                          },
                          fail: function(e) {
                            console.log(e.errMsg)
                            wx.hideLoading()
                          }
                      })

                      },
                      fail (res) { 
                        wx.showToast({
                          title: '充值失败',
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
      })

  },

  setCode: function(e) {
    this.setData({
      code: e.detail.value,
    })
  },

  sendSMS: function(e) {

    if (!this.data.phoned) {
      wx.showToast({
        title: '请先获取手机号',
      })
      return
    }

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
        phone: thiz.data.phone,
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
    console.log(this.data.depositAmount)
    if (this.data.depositAmount<=0) {
      wx.showToast({
        title: '请输入充值金额',
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