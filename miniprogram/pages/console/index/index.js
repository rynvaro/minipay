// miniprogram/pages/console/index/index.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: '',
    passwidth: '100%',
    bypass: true,
    title: '密码登录',
    passph: '密码',
    inputType: 'password',

    label: '获取验证码',
    code: '',
    codeID: '',
    sendSMSClicked: false,
    seconds: 60,
  },

  switch: function(e) {
    if (this.data.bypass) {
      this.bycode()
    }else {
      this.bypass()
    }
  },

  bypass: function(e) {
    this.setData({
      title: "密码登录",
      bypass: true,
      passwidth: '100%',
      passph: '密码',
      inputType: 'password',
    })
  },

  bycode: function(e) {
    this.setData({
      title: "验证码登录",
      bypass: false,
      passwidth: '50%',
      passph: '验证码',
      inputType: 'text',
    })
  },

  resetPassword: function(e) {
    wx.navigateTo({
      url: '../modifyPassword/modifyPassword',
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
    let thiz = this
    wx.cloud.callFunction({
      name:"consoleLogin",
      data:{
        type: 'precheck',
      },
      success(res) {
        wx.hideLoading()
          console.log(res)
          if (res.result == -1) {
            thiz.bycode()
          }else if (res.result == 1) {
            thiz.bypass()
          }else {
            thiz.bycode()
          }
      },
      fail: function(e) {
        wx.hideLoading()
        thiz.bycode()
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

  setPhone: function(e) {
    this.setData({
      phone:  e.detail.value
    })
  },

  setPassword: function(e) {
    this.setData({
      password:  e.detail.value,
      code: e.detail.value,
    })
  },

  login: function(){

    if (!/^1[3456789]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号不合法',
      })
      return 
    }


    if (this.data.password.length < 6) {
      wx.showToast({
        title: '密码格式不正确',
      })
      return 
    }

    wx.showLoading({
      title: '登录中...',
    })

    let thiz = this
    wx.cloud.callFunction({
      name:"consoleLogin",
      data:{
        code: thiz.data.code,
        codeID: thiz.data.codeID,
        phone: thiz.data.phone,
        password: thiz.data.password,
        bypass: thiz.data.bypass,
        type: 'login',
      },
      success(res) {
        wx.hideLoading()
          console.log(res)
          if (res.result == -1) {
            wx.showModal({
              title: '提示',
              content: '首次登录请通过验证码方式登录，登录后可设置登录密码！',
            })
            return
          }
          if (res.result == -2) {
            wx.showModal({
              title: '提示',
              title: '请先用验证码方式登录设置密码',
            })
            return
          }
          if (res.result == -3) {
            wx.showToast({
              title: '密码错误',
            })
            return
          }
          if (res.result == -4) {
            wx.showToast({
              title: '验证码错误',
            })
            return
          }
          if (res.result == -5) {
            wx.showToast({
              title: '验证码已过期',
            })
            return
          }
          app.globalData.storeID = res.result._id
          wx.navigateTo({
            url: '../home/home'
          })    
      },
      fail: function(e) {
        console.log(e.errMsg)
        wx.hideLoading()
        wx.showToast({
          title: '验证码错误',
        })
      }
    })
  },

  sendSMS: function(e) {

    if (!/^1[3456789]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号不合法',
      })
      return 
    }

    wx.showLoading({
      title: '正在检测...',
    })

    let thiz = this
    if (thiz.data.sendSMSClicked) {
        return 
      }
      thiz.setData({
        sendSMSClicked: true,
      })

      thiz.setData({
        label: thiz.data.seconds + '秒'
      });

      wx.showLoading({
        title: '发送中...',
      })

      // 启动以1s为步长的倒计时
    var interval = setInterval(() => {
        countdown(thiz);
    }, 1000);
    // 停止倒计时
    setTimeout(function() {
        clearInterval(interval);
    }, thiz.data.seconds * 1000);

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
})

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