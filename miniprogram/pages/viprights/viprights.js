// miniprogram/pages/viprights/viprights.js
const defaultH = '300rpx'
const toggledH = '600rpx'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        cards: [
            {
                "id": 0,
                "level":"1",
                "tips":[
                    "VIP可换购，享受基础折扣9.5折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.5折，享新人优惠券",
                ]
            },
            {
                "id": 1,
                "level":"2",
                "tips":[
                    "VIP可换购，享受基础折扣9.3折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.3折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.3折，享新人优惠券",
                ]
            },
            {
                "id": 2,
                "level":"3",
                "tips":[
                    "VIP可换购，享受基础折扣9.0折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.0折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.0折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.0折，享新人优惠券",
                    "VIP可换购，享受基础折扣9.0折，享新人优惠券",
                ]
            }
        ],
        level: 1,
        toggles: [false, false, false],
        cardHeights: [defaultH,defaultH,defaultH],
    },

    toggle: function(e) {
        let id = e.currentTarget.dataset.id
        for (var i in this.data.toggles) {
            if (i == id) {
                this.data.toggles[i] = true
            }else {
                this.data.toggles[i] = false
            }
        }
        for (var i in this.data.cardHeights) {
            if (i == id) {
                this.data.cardHeights[i] = toggledH
            }else {
                this.data.cardHeights[i] = defaultH
            }
        }
        this.setData({
            toggles: this.data.toggles,
            cardHeights: this.data.cardHeights,
        })
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