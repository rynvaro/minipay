// miniprogram/pages/event/event.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        event: {},
        user: {},
        show: false,
        storeId: ''
    },

    cancel: function(e) {
      this.setData({show: false})
    },

    confirm: function(e) {
      if(!this.data.storeId) {
        wx.showToast({
          title: '请选择参与商家',
        })
        return
      }
      wx.navigateTo({
        url: '../specialorder/specialorder?storeID='+this.data.storeId,
      })
    },

    selectStore: function(e) {
      this.setData({storeId: e.detail.value})
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            event: JSON.parse(options.event)
        })
        let thiz = this 
        wx.showLoading({
          title: 'loading...',
          mask: true,
        })
        wx.cloud.callFunction({
            name:"zlogin",
            success(res) {
                wx.hideLoading()
                console.log(res)
                let user = res.result.data.data
                thiz.setData({
                    user: user,
                })
            },
            fail: function(e) {
              wx.hideLoading()
              console.log(e)
            }
        })
    },

    detail: function(e) {
        if (!this.data.user.phone) {
            wx.showModal({
                title: '提示',
                content: '请先在首页点击头像完善个人资料。',
            })
            return
        }
        
        // 检查是否参与过
        wx.showLoading({
          title: '加载中...',
          mask: true,
        })
        let thiz = this
        wx.cloud.callFunction({
          name:"zcheckevent",
          data: {
            eventId: thiz.data.event._id
          },
          success(res) {
              wx.hideLoading()
              console.log(res)
              if (res.result.data.length == 0) {
                thiz.setData({show: true})
              }else {
                if (res.result.data[0].pay3Confirmed) {
                  wx.showModal({
                    title: '提示',
                    content: '不可重复参与',
                    success (rr) {
                      if (rr.confirm) {
                        wx.navigateTo({
                          url: '../orderDetail/orderDetail?id='+res.result.data[0]._id,
                        })
                      } else if (rr.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                }else {
                  thiz.setData({show: true})
                }
              }
          },
          fail: function(e) {
            wx.hideLoading()
            wx.showToast({
              title: '参与失败',
            })
            console.log(e)
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