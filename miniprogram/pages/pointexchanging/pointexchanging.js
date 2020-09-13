// miniprogram/pages/pointexchaning/pointexchanging.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // input默认是1
        num: 1,// 兑换份数
        // 使用data数据对象设置样式名
        minusStatus: 'disabled',
        coupon: {},
        user: {},
        viplevel: 1,
    },
    /* 点击减号 */
	bindMinus: function() {
		var num = this.data.num;
		// 如果大于1时，才可以减
		if (num > 1) {
			num --;
		}
		// 只有大于一件的时候，才能normal状态，否则disable状态
		var minusStatus = num <= 1 ? 'disabled' : 'normal';
		// 将数值与状态写回
		this.setData({
			num: num,
			minusStatus: minusStatus
		});
	},
	/* 点击加号 */
	bindPlus: function() {
		var num = this.data.num;
		// 不作过多考虑自增1
		num ++;
		// 只有大于一件的时候，才能normal状态，否则disable状态
		var minusStatus = num < 1 ? 'disabled' : 'normal';
		// 将数值与状态写回
		this.setData({
			num: num,
			minusStatus: minusStatus
		});
	},
	/* 输入框事件 */
	bindManual: function(e) {
		var num = e.detail.value;
		// 将数值与状态写回
		this.setData({
			num: num
		});
    },
    
    doExchange: function() {
        if (this.data.num * this.data.coupon.point > this.data.user.point) {
            wx.showToast({
                title: '您的积分不足',
              })
            return 
        }

        if (this.data.viplevel == 1 && this.data.coupon.type == 1) {
            wx.showToast({
              title: '当前等级不可兑换',
            })
            return
        }

        wx.showLoading({
          title: 'loading...',
        })

        let thiz = this
        wx.cloud.callFunction({
            name:"zdoexchange",
            data: {
                cnt: thiz.data.num,
                couponID: thiz.data.coupon.id,
            },
            success(res) {
                wx.hideLoading()
                console.log(res)
                wx.showModal({
                    title: '提示',
                    content: '兑换成功！',
                    success (res) {
                      if (res.confirm) {
                        if (thiz.data.coupon.type == 1) {
                            wx.navigateTo({
                                url: '../coupon/coupon',
                              })
                        }else if (thiz.data.coupon.type == 2) {
                            wx.navigateTo({
                                url: '../vipexperience/vipexperience',
                            })
                        }
                        
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                        thiz.onLoad()// TODO
                      }
                    }
                  })
            },
            fail: function(e) {
                wx.hideLoading()
                console.log(e)
                wx.showToast({
                  title: '兑换失败',
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({coupon: JSON.parse(options.coupon)})
        let thiz = this
        wx.cloud.callFunction({
            name:"zgetuserinfo",
            success(res) {
                wx.hideLoading()
                console.log(res)
                let user = res.result.data.data
                thiz.setData({
                    viplevel: user.level,
                    user: user,
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