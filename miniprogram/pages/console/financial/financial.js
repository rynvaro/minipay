// miniprogram/pages/console/financial/financial.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      balance: 0,
      withdrawHis: []
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
      wx.showLoading({
        title: 'loading...',
      })
      let thiz = this
      wx.cloud.callFunction({
            name:"getInfo",
            data: {
              storeID: app.globalData.storeID,
            },
            success(res) {
                console.log(res)
                thiz.setData({
                    balance: res.result.data.balance
                })
                wx.hideLoading()
            },
            fail: function(e) {
              console.log(e.errMsg)
              wx.hideLoading()
            }
        })

        // TODO 函数合并

        wx.cloud.callFunction({
            name:"withdraws",
            data: {
              storeID: app.globalData.storeID,
            },
            success(res) {
                console.log(res)
                thiz.setData({
                  withdrawHis: res.result.data,
                })
            },
            fail: function(e) {
              console.log(e.errMsg)
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

    cancelWithdraw: function(e) {
      console.log(e.currentTarget.dataset.id)
      wx.showLoading({
        title: '撤销中...',
      })
      let thiz = this
      var promise = new Promise(function (resolve, reject) {
        wx.cloud.callFunction({
            name:"hasPermission",
            data: {
              id: e.currentTarget.dataset.id,
              storeID: app.globalData.storeID,
            },
            success(res) {
                console.log(res)
                resolve(true)
            },
            fail: function(e) {
              console.log(e)
              resolve(false)
            }
        })
      });

      promise.then(function(hasPermission){
        console.log("has permission: ", hasPermission)
        if (!hasPermission) {
          wx.showToast({
            title: '没有权限',
          })
          wx.hideLoading()
        } else {
            wx.cloud.callFunction({
              name:"cancelWithdraw",
              data: {
                storeID: app.globalData.storeID,
                id: e.currentTarget.dataset.id
              },
              success(res) {
                  console.log(res)
                  thiz.onShow()
                  wx.hideLoading()
              },
              fail: function(e) {
                console.log(e.errMsg)
                wx.hideLoading()
              }
            })
        }
      })
    },

    withdraw: function() {

      if (this.data.balance<=0) {
        wx.showToast({
          title: '余额不足',
        })
        return
      }

      wx.requestSubscribeMessage({
        tmplIds: ['SLBtHQYki0LoIHTl0YPhKOKfaNAJk55Wuk_01kd2Ogw'],
        success (res) { },
        fail(e) {
          console.log(e)
        }
      })

      let thiz = this
      var promise = new Promise(function (resolve, reject) {
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

      promise.then(function(hasPermission){
        console.log("has permission: ", hasPermission)
        if (!hasPermission) {
          wx.showToast({
            title: '没有权限',
          })
        } else {
          wx.navigateTo({
            url: '../withdraw/withdraw',
          })
        }
      })
      
    }
})