//index.js
const app = getApp();

Page({
    data: {
        show: false,
        user: {
            avatarUrl:'',
            name: '登录/注册',
            exp: 0,
            expTotal: 6000,
            city: '',
            country: '',
            gender: 0,
            language: '',
            nickName: '',
            province: '',
        },
        login: false,
    },

    onLoad: function() {
      wx.showLoading({
        title: 'loading...',
      })
      let thiz = this
      wx.cloud.callFunction({
          name:"zlogin",
          success(res) {
              wx.hideLoading()
              console.log(res)
              thiz.setData({
                  user: res.result.data.data,
                  login: true,
              })
          },
          fail: function(e) {
            wx.hideLoading()
            console.log(e)
          }
      })
    },

    register: function(e) {
        if (this.data.login) {
            return 
        }
        console.log(e)
        this.setData({
            user: {
                avatarUrl: e.detail.userInfo.avatarUrl,
                name: e.detail.userInfo.nickName,
                nickName: e.detail.userInfo.nickName,
                exp: 0,
                expTotal: 6000,
                city: e.detail.userInfo.city,
                country: e.detail.userInfo.country,
                gender: e.detail.userInfo.gender,
                language: e.detail.userInfo.language,
                province: e.detail.userInfo.province,
            }
        })
        wx.showLoading({
          title: 'loading...',
        })
        let thiz = this
        wx.cloud.callFunction({
            name:"zregister",
            data: thiz.data.user,
            success(res) {
                wx.hideLoading()
                console.log(res)
                thiz.setData({
                    login: true,
                })
            },
            fail: function(e) {
              wx.hideLoading()
              console.log(e)
            }
        })
    },

    scan: function(e) {
        console.log(e)
        // wx.scanCode({
        //     success (res) {
        //         console.log(res)
        //         wx.navigateTo({
        //           url: '../map/map',
        //         })
        //     }
        // })
        wx.requestPayment({
            timeStamp: '',
            nonceStr: '',
            package: '',
            signType: 'MD5',
            paySign: '',
            package:'xxxx',
            success (res) { },
            fail (res) { }
          })
    },

    vipexperience: function(){
        wx.navigateTo({
            url: '../vipexperience/vipexperience',
        })
    },

    balance: function(){
        wx.navigateTo({
            url: '../balance/balance',
        })
    },

    coupon: function(){
        wx.navigateTo({
            url: '../coupon/coupon',
        })
    },

    pointexchange: function(){
        wx.navigateTo({
            url: '../pointexchange/pointexchange',
        })
    },

    signin: function(){
        wx.navigateTo({
            url: '../signin/signin',
        })
    },

    orders: function(){
        wx.navigateTo({
            url: '../orders/orders',
        })
    },

    point: function(){
        wx.navigateTo({
            url: '../point/point',
        })
    },

    feedback: function(){
        wx.navigateTo({
            url: '../feedback/feedback',
        })
    },

    storeregister: function(){
        wx.navigateTo({
            url: '../storeregister/storeregister',
        })
    },

    service: function(e){
            this.setData({show:true})
    },

    hidden: function(e) {
        this.setData({show:false})
    },

})