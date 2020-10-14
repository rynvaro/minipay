// miniprogram/pages/orderDetail/orderDetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: {},
        wxChecked: false,
        balanceChecked: false,
        overlordChecked: false,
        coupon: {
            coupon: {
                value: 0
            }
        },
        walterhidden: true,
    },

    confirmOrder: function(e) {
        let thiz = this
        wx.showLoading({
          title: 'loading...',
        })
        wx.cloud.callFunction({
            name:"zconfirmorder",
            data: {
                id: thiz.data.order._id
            },
            success(res) {
                console.log(res)
                wx.hideLoading()
                wx.showToast({
                  title: '已确认',
                })
                thiz.data.order.pay3Confirmed = true
                thiz.setData({order: thiz.data.order})
            },
            fail: function(e) {
                console.log(e)
                wx.hideLoading()
                wx.showToast({
                    title: '确认失败',
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.showmark) {
            this.setData({walterhidden: false})
        }
        let thiz = this
        wx.showLoading({
          title: 'loading...',
        })
        wx.cloud.callFunction({
            name:"zorder",
            data: {
                id: options.id
            },
            success(res) {
                console.log(res)
                thiz.setData({order: res.result.order, coupon: res.result.coupon.data})
                if (res.result.order.payType==1) {
                    thiz.setData({wxChecked: true})
                }else if (res.result.order.payType==2) {
                    thiz.setData({balanceChecked: true})
                }else if (res.result.order.payType==3) {
                    thiz.setData({overlordChecked: true})
                }
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

    }
})