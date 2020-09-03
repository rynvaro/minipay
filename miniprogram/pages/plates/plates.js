// miniprogram/pages/plates/plates.js
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        navBarHeight: app.globalData.navBarHeight,
        plate: {
            id: 0,
            title: "超实惠",
            headerImage: '../../images/tmp/store.png',
            items: [
            {
                id: 0,
                image: '../../images/logo.png',
                title: '买单8.8折扣',
                desc: '麦当劳西直门店，好吃。色香味俱全，优惠好礼送不完。甜品第二杯半价。更多优惠!',
            },
            {
                id: 1,
                image: '../../images/logo.png',
                title: '买单8.8折扣',
                desc: '麦当劳西直门店，好吃。色香味俱全，优惠好礼送不完。甜品第二杯半价。更多优惠!',
            },
            {
                id: 2,
                image: '../../images/logo.png',
                title: '买单8.8折扣',
                desc: '麦当劳西直门店，好吃。色香味俱全，优惠好礼送不完。甜品第二杯半价。更多优惠!',
            },
            {
                id: 3,
                image: '../../images/logo.png',
                title: '买单8.8折扣',
                desc: '麦当劳西直门店，好吃。色香味俱全，优惠好礼送不完。甜品第二杯半价。更多优惠!',
            }
            ]
        },
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