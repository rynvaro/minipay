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
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        payAmount: 0,
        rebate: 0,
        realAmount: 0,
        totalAmount: 0,// 最终要支付的金额
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
    },

    setPayment: function(e) {
      
      let payAmount = e.detail.value=='' ? 0 : e.detail.value * 1
      let rebate = (payAmount*(1-(this.data.preOrder.realDiscount/10))).toFixed(2)
      let realAmount = (payAmount - parseFloat(rebate)).toFixed(2)
      let totalAmount = parseFloat(realAmount)
      let couponValue = this.data.coupon.coupon.value/100

      if (couponValue < totalAmount) {
        totalAmount = totalAmount - couponValue
      }else {
        totalAmount = 0
      }
      totalAmount = (totalAmount + this.data.mustPayment).toFixed(2)

      this.setData({payAmount: payAmount, rebate: rebate, realAmount: realAmount, totalAmount: totalAmount})
    },

    setMustPayment: function(e) {
      let mustPay = e.detail.value=='' ? 0 : e.detail.value * 1
      if (mustPay < 0) {
        mustPay = 0
      }

      let totalAmount = parseFloat(this.data.realAmount)
      let couponValue = this.data.coupon.coupon.value/100
      if (couponValue < totalAmount) {
        totalAmount = totalAmount - couponValue
      }else {
        totalAmount = 0
      }
      totalAmount = (totalAmount + mustPay).toFixed(2)

      this.setData({mustPayment: mustPay, totalAmount: totalAmount})
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
      this.setData({storeID: options.storeID})
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
      if (this.data.payAmount <=0 ) {
        wx.showToast({
          title: '请输入支付金额',
        })
        return
      }
      if (this.data.totalAmount <=0 ) {
        this.setData({payby: 2})
      }
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
        },
        success(res) {
            console.log(res)
            if (thiz.data.payby == 2) {
              thiz.paybyBalance(orderId)
            } else {
              thiz.paybyWechat(orderId)
            }
        },
        fail: function(e) {
          console.log(e)
          wx.hideLoading()
          wx.showToast({
            title: '下单失败',
          })
        }})
      // ----------------------
      // 2. 支付
          
      },
    
      hidden: function(e) {
        moveY = 200;
        action = 'hide';
        animationEvents(this,moveY,action)
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
        wx.navigateTo({
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
      depositAmount: parseFloat(thiz.data.totalAmount),
      body: "柒号生活-消费",
      orderId: orderId,
    },
    success(payInfoRes) {
        wx.hideLoading()
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
                    wx.navigateTo({
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