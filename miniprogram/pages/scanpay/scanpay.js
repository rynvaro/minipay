// miniprogram/pages/scanpay/scanpay.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        merchantID: '',
        payAmount: 0,
    },

    setPayAmount: function(e){
        this.setData({payAmount: e.detail.value})
    },

    nextStep: function(){
        if (this.data.payAmount<=0) {
            wx.showToast({
              title: '请输入支付金额',
            })
            return
        }
        if (this.data.merchantID=='') {
            wx.showToast({
              title: '未知错误',
            })
            return
        }

        wx.navigateTo({
          url: '../order/order?payAmount='+this.data.payAmount+'&merchantID='+this.data.merchantID,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({merchantID: options.merchantID})
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