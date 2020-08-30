// miniprogram/pages/signin/signin.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        user: {
            signs: 0,
        },
        disable: false,
    },

    sign: function(){
        this.setData({disable: true})
        wx.showLoading({
            title: 'loading...',
          })
        let thiz = this
        wx.cloud.callFunction({
            name:"zdosign",
            success(res) {
                thiz.setData({disable: false})
                wx.hideLoading()
                console.log(res)
                if (res.result==2) {
                    wx.showToast({
                      title: '今日已签过到',
                    })
                }else if (res.result==1) {
                    wx.showModal({
                        title: '提示',
                        content: '签到成功',
                        success (res) {
                            thiz.onLoad()
                        }
                      })
                }
                
            },
            fail: function(e) {
                thiz.setData({disable: false})
                wx.hideLoading()
                console.log(e)
            }
        })
    },

    point: function(){
        wx.navigateTo({
          url: '../point/point',
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
            name:"zgetuserinfo",
            success(res) {
                wx.hideLoading()
                console.log(res)
                thiz.setData({
                    user: res.result.data.data,
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