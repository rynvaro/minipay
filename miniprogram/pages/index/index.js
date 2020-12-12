//index.js
const app = getApp();
// const plugin = requirePlugin('WechatSI');

// const db = wx.cloud.database({env: 'dev-osmu3'})
Page({
    data: {
        show: false,
        user: {
            avatarUrl:'',
            name: '登录/注册',
            exp: 0,
            expTotal: 1001,
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
            level: 1,
        },
        phoneFilled: true,
        login: false,

        // progress value
        p1v: 0,
        p2v: 0,

        closeRedpack: false,
        open: false,
        redpackShow: false,
        redpackValue: 0,
        redpackBtnShow: false,

        moreInfoShow: false,

        moreInfoPhone: '',
        moreInfoInviteCode: '',

        code: '',
        codeID: '',
        sendSMSClicked: false,
        seconds: 60,
        label: '获取验证码',
        birthday: '点击选择',
        birthed: false,
        focused: false,
        signinTipsHidden: true,
    },

    hiddenSign: function(e) {
      this.setData({signinTipsHidden: true})
    },

    gotoSignin: function(e) {
      wx.navigateTo({
        url: '../signin/signin',
      })
    },

    seeRedpack: function(e) {
      wx.navigateTo({
        url: '../coupon/coupon',
      })
    },

    onTabItemTap: function(e) {
      console.log(e)
    },

    setBirthday: function(e) {
      this.data.user.birthday = e.detail.value
      this.setData({birthday: e.detail.value, birthed: true,user: this.data.user})
    },

    console: function(e) {
      wx.navigateTo({
        url: '../console/index/index',
      })
    },

    onLoad: function(e) {
      //   console.log(db.collection('todos').get())

      //   const watcher = db.collection('todos').where({status: 1}).watch({
      //     onChange: function(snapshot) {
      //       wx.showToast({
      //         title: 'haha',
      //       })
      //       console.log('docs\'s changed events', snapshot.docChanges)
      //       console.log('query result snapshot after the event', snapshot.docs)
      //       console.log('is init data', snapshot.type === 'init')
      //       const innerAudioContext = wx.createInnerAudioContext();
      // innerAudioContext.autoplay = true;
      // plugin.textToSpeech({
      //   lang: "zh_CN",
      //   tts: true,
      //   content: "柒号生活到账10元",
      //   success: function(res) {
    
      //     console.log(res);
      //     // console.log("succ tts", res.filename);
      //     innerAudioContext.src = res.filename;
    
      //     innerAudioContext.onPlay(() => {
      //       console.log('开始播放');
    
      //     })
    
      //     innerAudioContext.onStop(() => {
      //       console.log('i am onStop');
      //       innerAudioContext.stop();
      //       //播放停止，销毁该实例
      //       innerAudioContext.destroy();
    
      //     })
    
      //     innerAudioContext.onEnded(() => {
      //       console.log('i am onEnded');
      //       //播放结束，销毁该实例
      //       innerAudioContext.destroy();
      //       console.log('已执行destory()');
      //     })
    
      //     innerAudioContext.onError((res) => {
      //       /*  console.log(res.errMsg);
      //        console.log(res.errCode); */
      //       innerAudioContext.destroy();
      //     })
    
      //   },
      //   fail: function(res) {
      //     console.log("fail tts", res)
      //   }
      // })
      //     },
      //     onError: function(err) {
      //       console.error('the watch closed because of error', err)
      //     }
      //   })
      // let code = '2222227hao'
      // let vcode = code.substr(0,6)
      // let vtoken = code.substr(6,4)
      // console.log(vcode)
      // console.log(vtoken)
      // let date = new Date()
      // date.setHours(16, 0, 0, 0)
      // date.setDate(1)
      // console.log("after set hours", date.getTime())
      // date.setMonth(date.getMonth()-1)
      // console.log(date.getTime())
      // console.log(date.getTime())
    },

    onShareAppMessage: function(e) {

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
        // if (this.data.moreInfoUsername.length<=0) {
        //     wx.showToast({
        //       title: '请输入姓名',
        //     })
        //     return
        // }

        if (!this.data.birthed) {
          wx.showToast({
            title: '请选择出生日期',
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
                        birthday: thiz.data.birthday,
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
                            title: '邀请码不存在',
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
        // if (this.data.phoneFilled) {
        //   wx.showToast({
        //     title: '您已完善',
        //   })
        //   return
        // }
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
      this.setData({open: true, closeRedpack: true})
      return
      // wx.showLoading({
      //   title: 'loading...',
      // })
      // let thiz = this
      // wx.cloud.callFunction({
      //   name:"zopenredpack",
      //   data: {
      //     redpackValue: thiz.data.redpackValue*100
      //   },
      //   success(res) {
      //       console.log(res)
      //       wx.hideLoading()
           
      //   },
      //   fail: function(e) {
      //       console.log(e.errMsg)
      //       wx.hideLoading()
      //       wx.showToast({
      //         title: '领取失败',
      //       })
      //   }
      // })
    },

    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

    hideRedpack:  function(e) {
        this.setData({redpackShow: false})
        this.onShow()
    },

    viprights: function(e) {
      // wx.cloud.callFunction({
      //   name:"aaaaaaaa",
      //   success(res) {
      //       console.log(res)
      //   },
      //   fail: function(e) {
      //     console.log(e)
      //   }
      // })
      // return
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
                  if (user.level == 1) {
                    p1v = user.exp/1000*100
                  }else if (user.level == 2) {
                      p1v = 100
                      p2v = user.exp/9000*100
                  }else if (user.level == 3) {
                    p1v = 100
                    p2v = 100
                  }

                  let phoneFilled = true
                  if (!user.phone) {
                      phoneFilled = false
                  }

                  // let redpackShow = false
                  // if (user.isFirstPay) {
                  //   redpackShow = true
                  // }
                  app.globalData.viplevel = user.level
                  thiz.setData({
                      user: user,
                      p1v: p1v,
                      p2v: p2v,
                      login: true,
                      phoneFilled: phoneFilled,
                      redpackValue: res.result.redpackValue/100,
                      // redpackShow: redpackShow,
                  })
              },
              fail: function(e) {
                wx.hideLoading()
                console.log(e)
              }
          })
          wx.cloud.callFunction({
            name:"zchecksignin",
            success(res) {
                console.log(res)
                if (res.result.status != 1) {
                  thiz.setData({signinTipsHidden: false})
                }else {
                  thiz.setData({signinTipsHidden: true})
                }
            },
            fail: function(e) {
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
                expTotal: 1001,
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
                level: 1,
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
                    redpackShow: true,
                    redpackValue: res.result.redpackvalue
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
      wx.redirectTo({
        url: '../indexpage/indexpage',
      })
      // wx.navigateTo({
      //   url: '../indexpage/indexpage',
      // })
        // console.log(e)
        // if (!app.globalData.viplevel) {
        //   wx.showModal({
        //     title: '提示',
        //     content: '请先授权登录'
        //   })
        //   return
        // }
        // wx.scanCode({
        //     success (res1) {
        //         console.log(res1)
        //         wx.cloud.callFunction({
        //           name:"zcheckpopup",
        //           data: {
        //             id: res1.result,
        //           },
        //           success(res) {
        //               console.log(res)
        //               wx.hideLoading()
        //               if (res.result.isPopup) {
        //                 if(!res.result.confirmed) {
        //                   wx.navigateTo({
        //                     url: '../specialorder/specialorder?storeID='+res1.result,
        //                   })
        //                 }else {
        //                   wx.navigateTo({
        //                     url: '../orderDetail/orderDetail?id='+res.result.orderId,
        //                   })
        //                 }
        //               }else {
        //                 wx.navigateTo({
        //                   url: '../order/order?storeID='+res1.result,
        //                 })
        //               }
        //           },
        //           fail: function(e) {
        //             console.log(e.errMsg)
        //             wx.hideLoading()
        //             wx.showModal({
        //               title: '提示',
        //               content: '请扫描7号生活二维码'
        //             })
        //           }
        //       })
        //     }
        // })
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
      focused: true,
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