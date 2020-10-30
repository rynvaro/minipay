// miniprogram/pages/lottory/lottory.js
const defaultLimit = 7
const rArrowStyle = 'border-top: 4rpx solid #999999; border-right: 4rpx solid #999999;'
const dArrowStyle = 'border-right: 4rpx solid #999999; border-bottom: 4rpx solid #999999;'
var rpx = 1
const screenWidth = 375
Page({

    /**
     * 页面的初始数据
     */
    data: {
        txtlist: [
            "用户 123xxxx456 获得现金红包100元",
            "用户 zzz 获得现金红包100元",
            "用户 4344 获得现金红包100元",
            "用户 ssss 获得现金红包100元",
        ],
        path: '',
        lottoryimage: '',
        user: {},
        round: 1,
        joinedusers: [],
        arrowStyle: rArrowStyle,
        hidden: true,
        drawed: false,
        clicked:false,
        len: 0,
    },

    doLottory: function(e) {
        if (this.data.clicked) {
            return
        }
        this.setData({clicked: true})
        if (!this.data.user.phone) {
            wx.showModal({
                title: '提示',
                content: '请先在首页完善个人信息',
                success (res) {
                    if (res.confirm) {
                        wx.switchTab({
                            url: '../index/index',
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
            return
        }
        if (this.data.drawed) {
            this.setData({hidden: false})
            return
        }
        if (this.data.user.status == 1) {
            // this.invite()
            return
        }else if (this.data.user.status == 2) {
            wx.showToast({
              title: '请等待开奖',
            })
            return
        }
        let thiz = this
        
        wx.requestSubscribeMessage({
            tmplIds: [
                'QkzsvPewwG2DNQORKHqmlvZxhkhYD9CHKF46lL1w_1M',
                'qAEG6JGuqUmi3_YEBQc7Rfo2XgqDqXZkAyjIMmH63-A',
                '2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg'
            ],
            success (res) { 
                console.log(res)
                // wx.showLoading({
                //     title: 'loading...',
                // })
                // ---
                thiz.zdolottory(res)
                // ---
            },
            fail: function(e) {
                console.log(e)
            }
          })
    },

    zdolottory: function(res) {
        let thiz = this
        wx.cloud.callFunction({
            name:"zdolottory",
            data: {
                eventId: thiz.data.event._id,
                avatarUrl: thiz.data.user.avatarUrl,
                name: thiz.data.user.name,
                level: thiz.data.user.level,
                round: thiz.data.round,
                phone: thiz.data.user.phone,
                res: res,
            },
            success(res) {
                wx.hideLoading()
                // wx.showToast({
                //   title: '参与成功',
                // })
                thiz.userlist(defaultLimit)
                thiz.data.user.status = 2
                thiz.setData({user: thiz.data.user})
                // thiz.invite()
            },
            fail: function(e) {
                console.log(e)
                wx.showToast({
                    title: '参与失败',
                  })
                wx.hideLoading()
            }
        })
    },

    seeall: function(e) {
        wx.navigateTo({
          url: '../lottoryusers/lottoryusers?eventId='+this.data.event._id,
        })
    },

    userlist: function(limit) {
        console.log(this.data.event._id)
        let thiz = this
        wx.cloud.callFunction({
            name:"zlottories",
            data: {
                eventId: thiz.data.event._id,
                round: thiz.data.round,
                limit: limit,
            },
            success(res) {
                thiz.setData({joinedusers: res.result.data,len: res.result.len.total})
            },
            fail: function(e) {
                console.log(e)
            }
        })
    },

    onCanvasLongPress: function(e){
        wx.canvasToTempFilePath({
            canvasId: 'shareImg',
            width: screenWidth * rpx * 0.8, 
            height: screenWidth * 1.78 * rpx * 0.8,
            destWidth: screenWidth * rpx * 0.8 *4,//输出的图片的宽度是画布区域的宽度的4倍
            destHeight: screenWidth * 1.78 * rpx * 0.8 *4,//输出的图片的高度是画布区域的高度的4倍
            success: res => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: (res) =>{
                        wx.showToast({
                          title: '保存成功',
                        })
                        this.setData({hidden: true})
                    },
                    fail: (err) => {
                        console.log(err) 
                        wx.showToast({
                          title: '保存失败',
                        })
                    }
                })
            },
            fail: (err) => {
                 console.log(err)
                wx.showToast({
                    title: '图片生成失败',
                    icon: 'success',
                    duration: 2000
                });
        }
    },this);
    },

    closeCanvasBox: function(e) {
        this.setData({hidden: true})
    },

    invite: function(e) {
        if (this.data.drawed){
            this.setData({hidden: false})
            return
        }
        wx.showLoading({
          title: '正在生成图片',
        })
        let thiz = this
        wx.getImageInfo({
          src: thiz.data.lottoryimage,
          success: function(res1){
              console.log(res1.path)
              wx.cloud.callFunction({
                name:"zminipcode",
                data: {
                },
                success(res) {
                    console.log(res)
                    let filtpath = `${wx.env.USER_DATA_PATH}/code.png`
                    let fs = wx.getFileSystemManager()
                    console.log('res.result.buffer',res.result.buffer)
                    fs.writeFileSync(filtpath,res.result.buffer,'utf-8')
    
                    const ctx = wx.createCanvasContext('shareImg');
                    ctx.drawImage(res1.path,0,0,screenWidth * rpx * 0.8, screenWidth * 1.78 * rpx * 0.8)
                    ctx.drawImage(filtpath,138 * rpx * 0.8,570 * rpx * 0.8,98 * rpx * 0.8,98 * rpx * 0.8)
                    ctx.draw();
    
                    fs.removeSavedFile({
                        filePath: filtpath,
                        complete(res) {
                            console.log(res)
                        }
                    })
                    wx.hideLoading()
                    thiz.setData({hidden: false, drawed: true})
                },
                fail: function(e) {
                    console.log(e.errMsg)
                    wx.hideLoading()
                }
            })
          },
          fail: function(e) {
            console.log(e)
          }
        })
        
        // wx.getImageInfo({
        //   src: '../../images/lottory.png',
        // })        

        
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let event = JSON.parse(options.event)
        event.lottoryTime = Date.parse(event.lottoryTime)
        this.setData({event: event})
        wx.setNavigationBarTitle({
          title: event.title,
        })
        wx.getSystemInfo({
            success: function(res) {
                rpx = (res.windowWidth/375).toFixed(2)
            }
        })
        this.userlist(defaultLimit)
        wx.showLoading({
          title: 'loading...',
          mask: true,
        })
        let thiz = this
        wx.cloud.callFunction({
            name:"zcheckuser",
            data: {
                eventId: thiz.data.event._id
            },
            success(res) {
                wx.hideLoading()
                if (res.result == -1) {
                    wx.showModal({
                        title: '提示',
                        content: '请先在首页注册',
                        success (res) {
                            if (res.confirm) {
                                wx.switchTab({
                                url: '../index/index',
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                    return
                }
                if (res.result == -2) {
                    wx.showModal({
                        title: '提示',
                        content: '请先在首页完善个人信息',
                        success (res) {
                            if (res.confirm) {
                                wx.switchTab({
                                url: '../index/index',
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                    return
                }
                console.log(res)
                let user = res.result.data.data
                thiz.setData({
                    user: user,
                    lottoryimage: res.result.data.lottoryimage,
                })
            },
            fail: function(e) {
              wx.hideLoading()
              console.log(e)
            }
        })
        // let thiz = this
        // wx.getImageInfo({
        //   src: 'cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/test/lottory.png',
        //   success: function(res){
        //       console.log(res.path)
        //       thiz.setData({path: res.path})
        //   },
        //   fail: function(e) {
        //     console.log(e)
        //   }
        // })
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