//index.js
const app = getApp();

Page({
    data: {
        show: false,
        user: {
            avatarUrl:'',
            name: '登录/注册',
            exp: 0,
            expTotal: 10000,
            city: '',
            country: '',
            gender: 0,
            language: '',
            nickName: '',
            province: '',
            balance: 0,
            point: 0,
            signs: 0,
            signDate: 0,
            sevenSigns: 0,// 七日连续签到数
            phone: '',
            payTimes: 0,
        },
        phoneFilled: true,
        login: false,

        // progress value
        p1v: 0,
        p2v: 0,
        open: false,
        redpackShow: false,
        redpackValue: 0,
        redpackBtnShow: false,

        moreInfoShow: false,

        moreInfoUsername: '',
        moreInfoPhone: '',
        moreInfoInviteCode: '',

        code: '',
        codeID: '',
        sendSMSClicked: false,
        seconds: 60,
        label: '获取验证码',
    },

    console: function(e) {
      wx.navigateTo({
        url: '../console/index/index',
      })
    },

    onLoad: function(e) {
    },

    setUsername: function(e) {
        this.setData({moreInfoUsername: e.detail.value})
    },

    setPhone: function(e) {
        this.setData({moreInfoPhone: e.detail.value})
    },

    setCode: function(e) {
        this.setData({code: e.detail.value})
    },

    setInviteCode: function(e) {
        this.setData({moreInfoInviteCode: e.detail.value})
    },

    submit: function(e) {
        if (this.data.moreInfoUsername.length<=0) {
            wx.showToast({
              title: '请输入姓名',
            })
            return
        }

        if (this.data.moreInfoPhone.length<=0) {
            wx.showToast({
              title: '请输入手机号',
            })
            return
        }

        if (!/^1[3456789]\d{9}$/.test(this.data.moreInfoPhone)) {
            wx.showToast({
              title: '手机号不合法',
            })
            return 
        }

        if (this.data.code.length <= 0) {
            wx.showToast({
              title: '请输入验证码',
            })
            return
        }

        if (this.data.code.length < 6) {
            wx.showToast({
              title: '验证码格式错误',
            })
            return
        }

        wx.showLoading({
          title: 'loading...',
        })

        let thiz = this

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
                  console.log(e)
                  resolve(false) // TODO maybe we should not use code
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
                    name:"zupdateuserinfo",
                    data: {
                        username: thiz.data.moreInfoUsername,
                        phone: thiz.data.moreInfoPhone,
                        inviteBy: thiz.data.moreInfoInviteCode,
                    },
                    success(res) {
                        console.log(res)
                        wx.hideLoading()

                        if (res.result.errCode == 87014) {
                          wx.showModal({
                            title: '提示',
                            content: '内容包含敏感词汇，请修改！',
                            success (res) {
                              if (res.confirm) {
                                console.log('用户点击确定')
                              } else if (res.cancel) {
                                console.log('用户点击取消')
                              }
                            }
                          })
                          return
                        }

                        if (res.result==-1) {
                          wx.showToast({
                            title: '不能邀请自己',
                          })
                          return 
                        }

                        if (res.result==-2) {
                          wx.showToast({
                            title: '兑换码不存在',
                          })
                          return 
                        }

                        wx.showToast({
                          title: '已更新',
                        })
                        thiz.setData({phoneFilled: true})
                        thiz.clodeMoreInfo()
                        thiz.onShow()
                    },
                    fail: function(e) {
                      console.log(e.errMsg)
                      wx.hideLoading()
                      wx.showToast({
                        title: '更新失败',
                      })
                    }
                })
            }
        })
    },

    showMoreInfo: function(e) {
        this.setData({moreInfoShow: true})
    },

    clodeMoreInfo: function(e) {
        this.setData({moreInfoShow: false})
    },

    invite: function(e) {
      wx.showToast({
        title: '暂未开放',
      })
        // wx.navigateTo({
        //   url: '../invite/invite',
        // })
    },

    openRedpack: function(e) {
      wx.showLoading({
        title: 'loading...',
      })
      let thiz = this
      wx.cloud.callFunction({
        name:"zopenredpack",
        data: {
          redpackValue: thiz.data.redpackValue*100
        },
        success(res) {
            console.log(res)
            wx.hideLoading()
            thiz.setData({open: true, closeRedpack: true})
        },
        fail: function(e) {
            console.log(e.errMsg)
            wx.hideLoading()
            wx.showToast({
              title: '领取失败',
            })
            thiz.setData({closeRedpack: true})
        }
      })
    },

    hideRedpack:  function(e) {
        this.setData({redpackShow: false})
        this.onShow()
    },

    viprights: function(e) {
        wx.navigateTo({
          url: '../viprights/viprights',
        })
    },

    onShow: function(e) {
        wx.showLoading({
            title: 'loading...',
          })
          let thiz = this
          wx.cloud.callFunction({
              name:"zlogin",
              success(res) {
                  wx.hideLoading()
                  console.log(res)
                  let user = res.result.data.data
                  let p1v = 0
                  let p2v = 0
                  if (user.exp>=0 && user.exp<=1000) {
                    p1v = user.exp/1000*100
                  }else if (user.exp > 1000 && user.exp<=10000) {
                      p1v = 100
                      p2v = user.exp/9000*100
                  }else if (user.exp > 10000) {
                    p1v = 100
                    p2v = 100
                  }

                  let phoneFilled = true
                  if (!user.phone) {
                      phoneFilled = false
                  }

                  thiz.setData({
                      user: user,
                      p1v: p1v,
                      p2v: p2v,
                      login: true,
                      phoneFilled: phoneFilled,
                      redpackValue: res.result.redpackValue/100,
                      redpackShow: user.isFirstPay,
                  })
              },
              fail: function(e) {
                wx.hideLoading()
                console.log(e)
              }
          })
    },

    register: function(e) {
        if (this.data.login) {
            return 
        }
        console.log(e)
        this.setData({
            user: {
                avatarUrl: e.detail.userInfo.avatarUrl,
                name: e.detail.userInfo.nickName,
                nickName: e.detail.userInfo.nickName,
                exp: 0,
                expTotal: 10000,
                city: e.detail.userInfo.city,
                country: e.detail.userInfo.country,
                gender: e.detail.userInfo.gender,
                language: e.detail.userInfo.language,
                province: e.detail.userInfo.province,
                province: '',
                balance: 0,
                point: 0,
                signs: 0,
                signDate: 0,
                sevenSigns: 0,
                phone: '',
                payTimes: 0,
            }
        })
        wx.showLoading({
          title: 'loading...',
        })
        let thiz = this
        wx.cloud.callFunction({
            name:"zregister",
            data: thiz.data.user,
            success(res) {
                wx.hideLoading()
                console.log(res)
                thiz.setData({
                    login: true,
                })
                thiz.onShow()
            },
            fail: function(e) {
              wx.hideLoading()
              console.log(e)
            }
        })
    },

    scan: function(e) {
        console.log(e)
        wx.scanCode({
            success (res) {
                console.log(res)
                wx.navigateTo({
                  url: '../order/order?merchantID='+res.result,
                })
            }
        })
    },

    vipexperience: function(){
        wx.navigateTo({
            url: '../vipexperience/vipexperience?user='+JSON.stringify(this.data.user),
        })
    },

    balance: function(){
        wx.navigateTo({
            url: '../balance/balance',
        })
    },

    coupon: function(){
        wx.navigateTo({
            url: '../coupon/coupon',
        })
    },

    pointexchange: function(){
        wx.navigateTo({
            url: '../pointexchange/pointexchange',
        })
    },

    signin: function(){
        wx.navigateTo({
            url: '../signin/signin',
        })
    },

    orders: function(){
        wx.navigateTo({
            url: '../orders/orders',
        })
    },

    point: function(){
        wx.navigateTo({
            url: '../point/point',
        })
    },

    feedback: function(){
        wx.navigateTo({
            url: '../feedback/feedback',
        })
    },

    storeregister: function(){
        wx.navigateTo({
            url: '../storeregister/storeregister',
        })
    },

    service: function(e){
            this.setData({show:true})
    },

    hidden: function(e) {
        this.setData({show:false})
    },


  sendSMS: function(e) {

    if (!/^1[3456789]\d{9}$/.test(this.data.moreInfoPhone)) {
        wx.showToast({
          title: '请输入合法手机号',
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
        phone: thiz.data.moreInfoPhone,
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