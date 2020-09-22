// miniprogram/pages/feedback/feedback.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        content: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    setTitle: function(e) {
        this.setData({title: e.detail.value})
    },

    setContent: function(e) {
        this.setData({content: e.detail.value})
    },
    
    submit: function(e) {

        if (!this.data.title) {
            wx.showToast({
              title: '请输入标题',
            })
            return
        }

        if (!this.data.content) {
            wx.showToast({
              title: '请输入内容',
            })
            return
        }

          wx.showLoading({
            title: 'loading...',
          })
          let thiz = this
          wx.cloud.callFunction({
              name:"zfeedback",
              data: {
                  title: thiz.data.title,
                  content: thiz.data.content,
              },
              success(res) {
                  wx.hideLoading()
                  console.log(res)
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
                  wx.showModal({
                    title: '提示',
                    content: '已提交',
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
              },
              fail: function(e) {
                wx.hideLoading()
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