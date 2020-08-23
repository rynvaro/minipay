// miniprogram/pages/pointexchange/pointexchange.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiperCurrent: 0,//当前所在页面的 index
        indicatorDots: true, //是否显示面板指示点
        autoplay: true, //是否自动切换
        interval: 3000, //自动切换时间间隔,3s
        duration: 1000, //滑动动画时长1s
        circular: true, //是否采用衔接滑动
        bannerUrls: [//图片路径(可以是本地路径，也可以是图片链接)
        '../../images/tmp/event.png',
        '../../images/logo.png',
        '../../images/tmp/store.png',
        ],
    },

    pointexchanging: function() {
        wx.navigateTo({
          url: '../pointexchanging/pointexchanging',
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