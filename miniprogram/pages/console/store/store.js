
// miniprogram/pages/console/store/store.js

const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      store: {}
    },

    setDesc: function(e) {
      this.data.store.storeDesc = e.detail.value
      this.setData({store: this.data.store})
    },

    bindStartTimeChange: function(e) {
      this.data.store.startTime = e.detail.value
      this.setData({store: this.data.store})
    },

    bindEndTimeChange: function(e) {
      this.data.store.endTime = e.detail.value
      this.setData({store: this.data.store})
    },


    selectLocation: function(){
      var that = this
      wx.chooseLocation({
        success: function(res) {
          console.log(res)
          that.data.store.address=res.address
          that.data.store.longitude = res.longitude
          that.data.store.latitude = res.latitude
          that.setData({store:that.data.store})
        },
        fail:function(e){
          console.log(e)
        }
      })
    },

    setStoreName: function(e) {
      this.data.store.storeName=e.detail.value
      this.setData({
        store:this.data.store
      })
    },

    // setMerchantInfo: function(e) {
    //   this.data.data.merchantInfo=e.detail.value
    //   this.setData({
    //     data:this.data.data
    //   })
    // },

    setRealName: function(e) {
      this.data.store.merchantName=e.detail.value
      this.setData({
        store:this.data.store
      })
    },

    setCardNumber: function(e) {
      this.data.store.merchantBankCard=e.detail.value
      this.setData({
        store:this.data.store
      })
    },

    setPhone: function(e) {
      this.data.store.merchantPhone=e.detail.value
      this.setData({
        store:this.data.store
      })
    },

    change: function(e) {
      console.log(e)
      this.data.store.storeType=e.detail.value
      this.setData({
        store:this.data.store
      })
    },

    publish: function(e){
      if (!this.data.store.storeName){
        wx.showToast({
          title: '请填写店铺名称',
        })
        return 
      }

      if (!this.data.store.merchantName){
        wx.showToast({
          title: '请填写真实姓名',
        })
        return 
      }

      if (!this.data.store.merchantBankCard){
        wx.showToast({
          title: '请填写收款卡号',
        })
        return 
      }

      if (!this.data.store.merchantPhone){
        wx.showToast({
          title: '请填写手机号',
        })
        return 
      }
      if (!this.data.store.address){
        wx.showToast({
          title: '请选择地址',
        })
        return 
      }
      if (!this.data.store.startTime || !this.data.store.endTime){
        wx.showToast({
          title: '请填写营业时间',
        })
        return 
      }

      if (!this.data.store.storeType){
        wx.showToast({
          title: '请选择店铺类型',
        })
        return 
      }

      if (!this.data.store.storeDesc){
        wx.showToast({
          title: '请输入描述',
        })
        return 
      }

      // if (!this.data.store.storeImage) {
      //   wx.showToast({
      //     title: '请选择门头图片',
      //   })
      //   return
      // }

      
      // if (!this.data.data.productImage) {
      //   wx.showToast({
      //     title: '请选择商品详情图片',
      //   })
      //   return
      // }

      let thiz = this

      wx.showLoading({
        title: '正在发布...',
      })

      var files = [this.data.store.storeImages[0],this.data.store.productImages[0]]


      var promise1 = new Promise(function (resolve, reject) {
        wx.cloud.callFunction({
            name:"hasPermission",
            data: {
              storeID: app.globalData.storeID,
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

      promise1.then(function(hasPermission){
        console.log("has permission: ", hasPermission)
        if (!hasPermission) {
          wx.showToast({
            title: '没有权限',
          })
        } else {
                
                // 1. 上传图片
                var promise = Promise.all(files.map((filePath, index) => {
                  if (filePath.startsWith("cloud")){
                    return new Promise(function(resolve, reject){
                      resolve(filePath)
                    })
                  }

                  var cloudPath = 'images/' + wxuuid() + filePath.match(/\.[^.]+?$/)[0]
                  
                  return new Promise(function (resolve, reject) {
                    wx.cloud.uploadFile({
                      cloudPath,
                      filePath,
                      success: res => {
                        console.log('[上传文件] 成功：', res)
                        resolve(res.fileID)
                      },
                      fail: e => {
                        console.error('[上传文件] 失败：', e)
                        wx.hideLoading()
                        wx.showToast({
                          icon: 'none',
                          title: '上传失败',
                        })
                      }
                    });
                  });
                }));

                // 设置
                promise.then(function(results){
                  // thiz.data.store.storeImages[0] = results[0]
                  // thiz.data.store.productImage[0] = results[1]
          
                  wx.cloud.callFunction({
                        name:"storeSetting",
                        data:{
                          id: thiz.data.store._id,
                          address: thiz.data.store.address,
                          startTime: thiz.data.store.startTime,
                          endTime: thiz.data.store.endTime,
                          storeDesc: thiz.data.store.storeDesc,
                          storeType: thiz.data.store.storeType,
                          longitude: thiz.data.store.longitude,
                          latitude: thiz.data.store.latitude,
                          merchantBankCard: thiz.data.store.merchantBankCard,
                          merchantPhone: thiz.data.store.merchantPhone,
                          storeName: thiz.data.store.storeName,
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
                          if (res.result == -1) {
                            wx.showToast({
                              title: '发布失败',
                            })
                            return
                          }
                          wx.showToast({
                            title: '发布成功',
                            success: function(){
                              setTimeout(function(){wx.navigateBack()},2000)
                            }
                          })
                        },
                        fail: function(e) {
                          console.log(e.errMsg)
                          wx.hideLoading()
                          wx.showToast({
                            title: '发布失败',
                          })
                        }
                      })
                })
        }
      })

  
  
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      wx.showLoading({
        title: 'loading...',
      })

      let thiz = this
      wx.cloud.callFunction({
          name:"getStoreSettingInfo",
          data: {
            storeID: app.globalData.storeID,
          },
          success(res) {
              console.log(res)
              thiz.setData({
                  store: res.result.data
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

    },

    // 选择图片或者视频
    select: function () {
        var that = this

        wx.chooseImage({
          count: 1,
          compressed: true,
          sourceType: ['album', 'camera'],
          success: (result) => {
            console.log(result)
            this.data.data.storeImage=result.tempFilePaths[0]
            this.setData({
              data:this.data.data
            })
          },
          fail: (res) => {
            console.log(res)
          }
        })

        // wx.chooseVideo({
        //   camera: 'back',
        //   compressed: true,
        //   maxDuration: 20,
        //   sourceType: ['album', 'camera'],
        //   success: (result) => {
        //     console.log(result)
        //     this.data.data.storeImage=result.tempFilePath
        //     this.setData({
        //       data:this.data.data
        //     })
        //   },
        
        //   complete: (res) => {
        //     console.log(res)
        //   },
        // })
      },

      // 选择图片或者视频
    selectProductImage: function () {
      var that = this

      wx.chooseImage({
        count: 1,
        compressed: true,
        sourceType: ['album', 'camera'],
        success: (result) => {
          console.log(result)
          this.data.data.productImage=result.tempFilePaths[0]
          this.setData({
            data:this.data.data
          })
        },
        fail: (res) => {
          console.log(res)
        }
      })
    },
})

const wxuuid = function () {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid

}