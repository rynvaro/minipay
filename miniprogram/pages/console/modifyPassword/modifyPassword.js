// miniprogram/pages/console/modifyPassword/modifyPassword.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    label: '获取验证码',
    phone: '',
    password: '',
    code: '',
    codeID: '',
    sendSMSClicked: false,
    seconds: 60,
  },

  setPhone: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  setNewPassword: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  setCode: function(e) {
    this.setData({
      code: e.detail.value
    })
  },



  reset: function(e) {

    if (!/^1[3456789]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号不合法',
      })
      return 
    }

    if (this.data.password < 6){
      wx.showToast({
        title: '密码不合法',
      })
      return
    }

    if (!this.data.code){
      wx.showToast({
        title: '请输入验证码',
      })
      return
    }

    wx.showLoading({
      title: '重置中...',
    })

    let thiz = this
    wx.cloud.callFunction({
      name:"validateCode",
      data: {
        code: thiz.data.code,
        codeID: thiz.data.codeID,
      },
      success(res) {
          console.log(res)
          wx.cloud.callFunction({
            name:"resetPassword",
            data: {
              phone: thiz.data.phone,
              password: thiz.data.password,
              type: 'reset',
            },
            success(res) {
                console.log(res)
                if (res.result == -1) {
                  wx.showToast({
                    title: '该手机号不存在',
                  })
                  return
                }
                wx.showToast({
                  title: '重置成功',
                  success: function(){
                    setTimeout(function(){wx.navigateBack()},500)
                  }
                })
            },
            fail: function(e) {
                console.log(e)
                wx.showToast({
                  title: '重置失败',
                })
            }
        })

      },
      fail: function(e) {
        console.log(e)
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

  }
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