
// miniprogram/pages/console/store/store.js

const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      id:'',
      uploadStoreImage: false,
      uploadProductImage: false,
      data: {
        storeImage: '',
        storeName: '',
        merchantInfo: '',
        realName: '',
        cardNumber: '',
        phone: '',
        location: {
          address: '点击选择地址',
        },
        seTime: '',
        productImage: ''
      }
    },

    selectLocation: function(){
      var that = this
      wx.chooseLocation({
        success: function(res) {
          console.log(res)
          that.data.data.location=res
          that.setData({data:that.data.data})
        },
        fail:function(e){
          console.log(e)
        }
      })
    },

    setStoreName: function(e) {
      this.data.data.storeName=e.detail.value
      this.setData({
        data:this.data.data
      })
    },

    setMerchantInfo: function(e) {
      this.data.data.merchantInfo=e.detail.value
      this.setData({
        data:this.data.data
      })
    },

    setRealName: function(e) {
      this.data.data.realName=e.detail.value
      this.setData({
        data:this.data.data
      })
    },

    setCardNumber: function(e) {
      this.data.data.cardNumber=e.detail.value
      this.setData({
        data:this.data.data
      })
    },

    setPhone: function(e) {
      this.data.data.phone=e.detail.value
      this.setData({
        data:this.data.data
      })
    },

    setSETime: function(e) {
      this.data.data.seTime=e.detail.value
      this.setData({
        data:this.data.data
      })
    },

    publish: function(e){
      if (!this.data.data.storeName){
        wx.showToast({
          title: '请填写店铺名称',
        })
        return 
      }

      if (!this.data.data.storeName){
        wx.showToast({
          title: '请填写店铺名称',
        })
        return 
      }

      if (!this.data.data.merchantInfo){
        wx.showToast({
          title: '请填写商家信息',
        })
        return 
      }

      if (!this.data.data.realName){
        wx.showToast({
          title: '请填写真实姓名',
        })
        return 
      }

      if (!this.data.data.cardNumber){
        wx.showToast({
          title: '请填写收款卡号',
        })
        return 
      }

      if (!this.data.data.phone){
        wx.showToast({
          title: '请填写手机号',
        })
        return 
      }
      if (!this.data.data.location.name){
        wx.showToast({
          title: '请选择地址',
        })
        return 
      }
      if (!this.data.data.seTime){
        wx.showToast({
          title: '请填写营业时间',
        })
        return 
      }

      if (!this.data.data.storeImage) {
        wx.showToast({
          title: '请选择门头图片',
        })
        return
      }

      
      if (!this.data.data.productImage) {
        wx.showToast({
          title: '请选择商品详情图片',
        })
        return
      }

      let thiz = this

      wx.showLoading({
        title: '正在发布...',
      })

      var files = [this.data.data.storeImage,this.data.data.productImage]


      var promise1 = new Promise(function (resolve, reject) {
        wx.cloud.callFunction({
            name:"hasPermission",
            data: {
              phone: app.globalData.phone,
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
                  thiz.data.data.storeImage = results[0]
                  thiz.data.data.productImage = results[1]
          
                  wx.cloud.callFunction({
                        name:"storeSetting",
                        data:{
                          id:thiz.data.id,
                          data:thiz.data.data,
                        },
                        success(res) {
                          console.log(res)
                          wx.showToast({
                            title: '发布成功',
                            success: function(){
                              setTimeout(function(){wx.navigateBack()},2000)
                            }
                          })
                        },
                        fail: function(e) {
                          console.log(e.errMsg)
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
      this.data.data.phone=app.globalData.phone
      this.setData({
        data:this.data.data
      })

      let thiz = this
      wx.cloud.callFunction({
          name:"getStoreSettingInfo",
          data: {
            phone: app.globalData.phone,
          },
          success(res) {
              console.log(res)
              thiz.setData({
                  data: res.result.data.data.data,
                  id:res.result.data._id
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