// miniprogram/pages/orderv2/orderv2.js
var action = 'show';
var moveY = 200;
var animation = animation = wx.createAnimation({
    transformOrigin: "50% 50%",
    duration: 400,
    timingFunction: "ease",
    delay: 0
})
animation.translateY(moveY + 'vh').step();
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        payAmount: 0,
        preOrder: {
          realDiscount: 0.00,
        },

        couponSelected: false,
        coupon: {
          coupon: {
            value: 0,
          }
        },
        storeID: '',
        payby: 1, // 1 wechat 2 balance
        mustPayment: 0.00,
        // 支付方式
        index: 3,
        array: ['请选择', '微信', '余额', '微信+余额'],

        user: {},

        balanceHidden: false,
        wxHidden: false,

        balancePayment: 0,
        wxPayment: 0,

        config: {},
    },

    bindPickerChange: function(e) {
      if (this.data.canUseBalance == "false" || !this.data.canUseBalance) {
          wx.showModal({
            title: '提示',
            content: '活动期间仅支持微信付款',
          })
          return
        }
        var bshow = false
        var vshow = false
        switch (e.detail.value) {
          case '1':
            bshow = false
            vshow = true
          break
          case '2': 
            bshow = true
            vshow = false
          break
          case '3':
            bshow = true
            vshow = true
          break
        }

        this.setData({index: e.detail.value, balanceHidden: !bshow, wxHidden: !vshow})
    },

    setPayment: function(e) {
      let payAmount = e.detail.value=='' ? 0 : e.detail.value * 1
      if (payAmount <=0 ) {
          payAmount = 0
      }
      this.setData({payAmount: parseFloat(payAmount)})
    },

    setMustPayment: function(e) {
      let mustPay = e.detail.value=='' ? 0 : e.detail.value * 1
      if (mustPay <= 0) {
        mustPay = 0
      }

      this.setData({mustPayment: parseFloat(mustPay)})
    },

    select: function() {
      if (this.data.preOrder.coupons.length > 0){
        wx.navigateTo({
          url: '../coupon/coupon?fromorder=true',
        })
      }
    },

    selectPay: function(e) {
      this.setData({payby: e.detail.value})
    },

    inputChange: function(e) {
      if (e.detail.length==6) {
        wx.showLoading({
          title: 'loading...',
        })
        let thiz = this
      
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log("options is: ", options)
      var canUseBalance = options.canUseBalance
      var index = 3
      var balanceHidden = false
      if (canUseBalance == "false" || !canUseBalance) {
        index = 1
        balanceHidden = true
      }
      var isScan = false
      if (options.isScan == "true") {
        isScan = true
      }

      this.setData({storeID: options.storeID,canUseBalance: canUseBalance, index: index,balanceHidden: balanceHidden, isScan: isScan})
      wx.showLoading({
        title: 'loading...',
      })
      let thiz = this
      
      wx.cloud.callFunction({
          name:"zrebuildorder",
          data: {
            storeID: options.storeID,
            level: app.globalData.viplevel,
          },
          success(res) {
              console.log(res)
              thiz.setData({preOrder: res.result.data})
              wx.setNavigationBarTitle({
                title: res.result.data.storeName,
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
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function (e) {
      let thiz = this
      wx.showLoading({
        title: 'loading...',
      })
      wx.cloud.callFunction({
          name:"zlogin",
          success(res) {
              wx.hideLoading()
              console.log(res)
              let user = res.result.data.data
              thiz.setData({user: user})
          },
          fail: function(e) {
            wx.hideLoading()
            console.log(e)
          }
      })

      wx.showLoading({
        title: 'loading...',
      })
      wx.cloud.callFunction({
        name:"zgetconfig",
        data: {
          confid: 'maprangeconfig'
        },
        success(res) {
            wx.hideLoading()
            console.log("config is: ", res)
            thiz.setData({config: res.result.data})
        },
        fail: function(e) {
          wx.hideLoading()
          console.log(e)
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

pay: function(e){

    console.log("this config: ", this.data.config)

    if (!this.data.config) {
      wx.showModal({
        title: '提示',
        content: '您所在地区暂不支持',
      })
      return 
    }

    console.log("app location is: ", app.globalData)

    console.log(app.globalData.location.latitude < this.data.config.latitude_start, app.globalData.location.latitude,  this.data.config.latitude_start)
    console.log(app.globalData.location.latitude > this.data.config.latitude_end, app.globalData.location.latitude, this.data.config.latitude_end)
    console.log(app.globalData.location.longitude < this.data.config.longitude_start, app.globalData.location.longitude, this.data.config.longitude_start)
    console.log(app.globalData.location.longitude > this.data.config.longitude_end, app.globalData.location.longitude , this.data.config.longitude_end)

    if (app.globalData.location.latitude < this.data.config.latitude_start || 
      app.globalData.location.latitude > this.data.config.latitude_end || 
      app.globalData.location.longitude < this.data.config.longitude_start||
      app.globalData.location.longitude > this.data.config.longitude_end) {
        wx.showModal({
          title: '提示',
          content: '您所在地区暂不支持',
        })
        return
    }


    if (this.data.payAmount <=0 ) {
      wx.showToast({
        title: '请输入支付金额',
      })
      return
    }
    if (this.data.index == 0) {
        wx.showToast({
          title: '请选择支付方式',
        })
        return 
    }

    if (this.data.index == 1) {
      if (this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment <=0) {
        this.setData({payby: 2,balancePayment: 0,wxPayment: 0})
      }else {
        this.setData({payby: 1, balancePayment: 0, wxPayment: (this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment)})
      }
    }

    if (this.data.index == 2) {
      if (this.data.user.balance / 100 < (this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment)) {
        wx.showToast({
          title: '"余额不足"',
        })
        return 
      }
      this.setData({payby: 2, balancePayment: (this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment), wxPayment: 0})
    }

    if (this.data.index == 3) {
      console.log(this.data.user.balance / 100,"--",this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment)
      if (this.data.user.balance / 100 >= (this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment)) {
        this.setData({payby: 2,balancePayment: (this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment), wxPayment: 0})
      }else {
        this.setData({payby: 4, balancePayment: parseFloat(this.data.user.balance/100), wxPayment: parseFloat(((this.data.payAmount - this.data.coupon.coupon.value/100 + this.data.mustPayment)-this.data.user.balance/100).toFixed(2))})
      }
    }
    console.log(this.data.payby)
    // return 

    let thiz = this
    // 如果是微信支付，且消费超过某值，则提醒授权获取优惠券发送提醒
    // TODO 确定此值
    if (this.data.payby == 1 && this.data.preOrder.threshold != -1 && parseFloat(this.data.payAmount) >= this.data.preOrder.threshold/100) {
      wx.requestSubscribeMessage({
        tmplIds: [
            'w27-oYHMzSoCke2C0j6VYmV9j3q6HnuO4jylKKg7Gv4',
        ],
        success (res) { 
          console.log(res)
          thiz.takeorder()
        },
        fail: function(e) {
            console.error(e)
            wx.showToast({
              title: '下单失败',
            })
        }
      })
    }else {
      this.takeorder()
    }
},
    
hidden: function(e) {
  moveY = 200;
  action = 'hide';
  animationEvents(this,moveY,action)
},

takeorder: function() {
  wx.showLoading({
    title: '支付中...',
    mask: true,
  })
  let thiz = this
  // 1. 下单
  // generate order id
  let orderId = genorderid()
  // ----------------------
  wx.cloud.callFunction({
    name:"ztakeorder",
    data: {
      orderId: orderId,
      storeID: thiz.data.storeID,
      payAmount: thiz.data.payAmount,
      mustPayAmount: thiz.data.mustPayment,
      couponID: thiz.data.couponSelected ? thiz.data.coupon._id : -1,
      payby: thiz.data.payby,
      balancePayment: thiz.data.balancePayment,
      wxPayment: thiz.data.wxPayment,
      location: app.globalData.location,
    },
    success(res) {
        // 2. 支付
        if (thiz.data.payby == 2) {
          thiz.paybyBalance(orderId)
        } else if (thiz.data.payby == 1){
          thiz.paybyWechat(orderId)
        } else if (thiz.data.payby == 4) {
          thiz.paybyMix(orderId)
        }
    },
    fail: function(e) {
      console.log(e)
      wx.hideLoading()
      wx.showToast({
        title: '下单失败',
      })
    }})
},

paybyMix: function(orderId) {
  let thiz = this
  console.log("0-0-x: ",parseFloat(thiz.data.wxPayment))
  wx.cloud.callFunction({
    name:"zgetpayinfo",
    data: {
      ip: '127.0.0.1', // TODO
      depositAmount: parseFloat(thiz.data.wxPayment),
      body: "柒号生活-消费",
      orderId: orderId,
    },
    success(payInfoRes) {
        wx.requestPayment({
            timeStamp: payInfoRes.result.res.payment.timeStamp,
            nonceStr: payInfoRes.result.res.payment.nonceStr,
            signType: payInfoRes.result.res.payment.signType,
            paySign: payInfoRes.result.res.payment.paySign,
            package: payInfoRes.result.res.payment.package,
            success (payRes) { 
              console.log(payRes)
              // 1. 确认充值结果 TODO
              wx.showLoading({
                title: '支付中...',
                mask: true,
              })
              wx.cloud.callFunction({
                name:"zdorderpay",
                data: {
                  orderId: orderId,
                  storeID: thiz.data.storeID,
                  payby: thiz.data.payby,
                },
                success(res) {
                    console.log(res)
                    wx.hideLoading()
                    wx.redirectTo({
                      url: '../paysuccess/paysuccess?orderId='+res.result._id,
                    })
                    // wx.redirectTo({
                    //   url: '../orderDetail/orderDetail?id='+res.result._id+'&showmark=true',
                    // })
                },
                fail: function(e) {
                  console.log(e.errMsg)
                  wx.hideLoading()
                }
            })},

            fail (res) { 
              wx.showToast({
                title: '支付失败',
              })
            }
          })
    },
    fail: function(e) {
      console.log(e.errMsg)
      wx.hideLoading()
      wx.showToast({
        title: '支付失败',
      })
    }
  })
},

paybyBalance: function(orderId) {
  let thiz = this
  wx.cloud.callFunction({
    name:"zdorderpay",
    data: {
      storeID: thiz.data.storeID,
      orderId: orderId,
      payby: thiz.data.payby,
    },
    success(res) {
        console.log(res)
        wx.hideLoading()
        if (res.result==-1) {
          wx.showToast({
            title: '余额不足',
          })
          return
        }
        if (res.result==-2) {
          wx.showToast({
            title: '密码错误',
          })
          return
        }
        wx.redirectTo({
          url: '../paysuccess/paysuccess?orderId='+res.result._id,
        })
        // wx.redirectTo({
        //   url: '../orderDetail/orderDetail?id='+res.result._id+'&showmark=true',
        // })
    },
    fail: function(e) {
      console.log(e.errMsg)
      wx.hideLoading()
      wx.showToast({
        title: '支付失败',
      })
    }
  })
},
paybyWechat: function(orderId) {
  let thiz = this
  wx.cloud.callFunction({
    name:"zgetpayinfo",
    data: {
      ip: '127.0.0.1', // TODO
      depositAmount: parseFloat(thiz.data.payAmount - thiz.data.coupon.coupon.value/100 + this.data.mustPayment),
      body: "柒号生活-消费",
      orderId: orderId,
    },
    success(payInfoRes) {
        wx.requestPayment({
            timeStamp: payInfoRes.result.res.payment.timeStamp,
            nonceStr: payInfoRes.result.res.payment.nonceStr,
            signType: payInfoRes.result.res.payment.signType,
            paySign: payInfoRes.result.res.payment.paySign,
            package: payInfoRes.result.res.payment.package,
            success (payRes) { 
              console.log(payRes)
              // 1. 确认充值结果 TODO
              wx.showLoading({
                title: '支付中...',
                mask: true,
              })
              wx.cloud.callFunction({
                name:"zdorderpay",
                data: {
                  orderId: orderId,
                  storeID: thiz.data.storeID,
                  payby: thiz.data.payby,
                },
                success(res) {
                    console.log(res)
                    wx.hideLoading()
                    wx.redirectTo({
                      url: '../paysuccess/paysuccess?orderId='+res.result._id,
                    })
                    // wx.redirectTo({
                    //   url: '../orderDetail/orderDetail?id='+res.result._id+'&showmark=true',
                    // })
                },
                fail: function(e) {
                  console.log(e.errMsg)
                  wx.hideLoading()
                }
            })},

            fail (res) { 
              wx.showToast({
                title: '支付失败',
              })
            }
          })
    },
    fail: function(e) {
      console.log(e.errMsg)
      wx.hideLoading()
      wx.showToast({
        title: '支付失败',
      })
    }
  })
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


function genorderid(){
  return (Math.random().toString().substr(2)+Math.random().toString().substr(2)+Math.random().toString().substr(2)).substr(0,32)
}