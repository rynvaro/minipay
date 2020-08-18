// miniprogram/pages/console/discount/discount.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentDiscount: '请选择折扣',
        currentDiscountIsNil: true,
        timeStart: '请选择开始时间',
        timeStartIsNil: true,
        timeEnd: '请选择结束时间',
        timeEndIsNil:true,

        array: [0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,3.0,3.1,3.2,3.3,3.4,3.5,3.6,3.7,3.8,3.9,4.0,4.1,4.2,4.3,4.4,4.5,4.6,4.7,4.8,4.9,5.0,5.1,5.2,5.3,5.4,5.5,5.6,5.7,5.8,5.9,6.0,6.1,6.2,6.3,6.4,6.5,6.6,6.7,6.8,6.9,7.0,7.1,7.2,7.3,7.4,7.5,7.6,7.7,7.8,7.9,8.0,8.1,8.2,8.3,8.4,8.5,8.6,8.7,8.8,8.9,9.0,9.1,9.2,9.3,9.4,9.5,9.6,9.7,9.8,9.9,10.0],
        index: 90,
    },

    bindDicountChange: function(e) {
        this.setData({
            index: e.detail.value,
            currentDiscountIsNil:false,
            currentDiscount: this.data.array[e.detail.value]
        })
    },

    bindTimeStartChange: function(e) {
        this.setData({
            timeStart: e.detail.value,
            timeStartIsNil: false,
          })
    },

    bindTimeEndChange: function(e) {
        this.setData({
            timeEnd: e.detail.value,
            timeEndIsNil: false
          })
    },

    submit: function(e) {
        if (this.data.currentDiscountIsNil){
            wx.showToast({
              title: '请选择折扣',
            })
            return 
        }

        if (this.data.timeStartIsNil){
            wx.showToast({
              title: '请选择开始时间',
            })
            return 
        }

        if (this.data.timeEndIsNil){
            wx.showToast({
              title: '请选择结束时间',
            })
            return 
        }

        wx.showLoading({
          title: '修改中...',
        })

    wx.cloud.callFunction({
        name:"discountSetting",
        data:{
          phone: app.globalData.phone,
          discount: this.data.currentDiscount,
          timeStart: this.data.timeStart,
          timeEnd: this.data.timeEnd,
        },
        success(res) {
          console.log(res)
          wx.navigateBack({
            delta: 0,
          })
          wx.hideLoading()
        },
        fail: function(e) {
          console.log(e.errMsg)
          wx.showToast({
            title: '没有权限',
          })
          wx.hideLoading()
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
            name:"getInfo",
            data: {
              phone: app.globalData.phone,
            },
            success(res) {
                console.log(res)
                thiz.setData({
                    timeEnd: res.result.data.discount.timeEnd,
                    timeStartIsNil: false,
                    timeStart: res.result.data.discount.timeStart,
                    timeEndIsNil: false,
                    currentDiscount: res.result.data.discount.discountValue,
                    currentDiscountIsNil: false,
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

    }
})