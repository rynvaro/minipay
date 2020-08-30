// miniprogram/pages/orders/orders.js
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

        orders: [
            {"title":"测试订单bbb的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":1.0},
{"title":"测试订单bbb的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":2.0},
{"title":"测试订单bbb的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":3.0},
{"title":"测试订单ccc的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":4.0},
{"title":"测试订单ddd的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":1.0},
{"title":"测试订单ddd的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":2.0},
{"title":"测试订单abc的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":3.0},
{"title":"测试订单aab的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":4.0},
{"title":"测试订单bbc的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":1.0},
{"title":"测试订单aaa的title","thumbUrl":"cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/020c435b-e85a-4895-8428-743a9165845b.jpeg","amount":76,"discount":9.8,"rebate":6.5,"realAmount":66.89,"coupon":1,"totalAmount":25.9,"status":2.0},
        ]
    },

    orderDetail: function(e) {
        // wx.navigateTo({
        //     url: '../order/order?id='+e.currentTarget.dataset.id,
        // })
    },

    search: function(e) {
        wx.showLoading({
            title: 'loading...',
        })
        listOrder(this,e.detail.value)
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

        listOrder(this,'')
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: 'loading...',
        })
        listOrder(this,'')
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

function listOrder(thiz, q){
    wx.hideLoading()
    // wx.cloud.callFunction({
    //     name:"orderList",
    //     data: {
    //         q: q,
    //         phone: app.globalData.phone,
    //         status: thiz.data.currentTabIndex,
    //     },
    //     success(res) {
    //         console.log(res)
    //         thiz.setData({orders: res.result.data})
    //         wx.hideLoading()
    //     },
    //     fail: function(e) {
    //         console.log(e.errMsg)
    //         wx.hideLoading()
    //     }
    // })
}