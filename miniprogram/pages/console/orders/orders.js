// miniprogram/pages/console/orders/orders.js

const tabColor = '#999999'
const tabColorSelected = '#EC9B76'
const tabFontSizeSelected = '35rpx'
const tabFontSize = '30rpx'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    
    data: {
        tabColors: [tabColorSelected,tabColor,tabColor,tabColor],
        tabFontSizes: [tabFontSizeSelected,tabFontSize,tabFontSize,tabFontSize],
        currentTabIndex: 0,

        orders: [],

        pageSize: 10,
        currentPage: 1,
        hasNext: false,
    },

    orderDetail: function(e) {
        wx.navigateTo({
            url: '../orderDetail/orderDetail?id='+e.currentTarget.dataset.id,
        })
    },

    search: function(e) {
        wx.showLoading({
            title: 'loading...',
        })
        listOrder(this,e.detail.value,'all',this.data.pageSize, this.data.currentPage)
    },

    onTabClick: function(e) {
        wx.showLoading({
          title: 'loading...',
        })
        var index = e.currentTarget.dataset.id
        for (var i in  this.data.tabColors) {
            if (i == index) {
                this.data.tabColors[i]=tabColorSelected
                this.data.tabFontSizes[i]=tabFontSizeSelected
            } else {
                this.data.tabColors[i]=tabColor
                this.data.tabFontSizes[i]=tabFontSize
            }
        }
        this.setData({
            tabColors:this.data.tabColors,
            tabFontSizes: this.data.tabFontSizes,
            currentTabIndex: index,
        })

        listOrder(this,'','all',this.data.pageSize, this.data.currentPage)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: 'loading...',
        })
        listOrder(this,'',options.type,this.data.pageSize, this.data.currentPage)
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

    onReachBottom: function () {
        if (this.data.hasNext) {
            wx.showLoading({
            title: 'loading...',
            })
            listOrder(this,'','all', this.data.pageSize, this.data.currentPage)
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})

function listOrder(thiz, q, type, pageSize, currentPage){
    wx.cloud.callFunction({
        name:"orderList",
        data: {
            q: q,
            storeID: app.globalData.storeID,
            status: thiz.data.currentTabIndex,
            type: type,
            pageSize: pageSize,
            currentPage: currentPage,
        },
        success(res) {
            console.log(res)
            thiz.setData({
                orders: thiz.data.orders.concat(res.result.data),
                currentPage: res.result.currentPage,
                hasNext: res.result.hasNext, 
            })
            wx.hideLoading()
        },
        fail: function(e) {
            console.log(e.errMsg)
            wx.hideLoading()
        }
    })
}