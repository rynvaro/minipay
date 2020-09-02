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
            balance: 0,
            point: 0,
            signs: 0,
            signDate: '',
        },
        login: false,

        // progress value
        p1v: 0,
        p2v: 0,
    },

    onLoad: function() {
      
    },

    viprights: function(e) {
        wx.navigateTo({
          url: '../viprights/viprights',
        })
    },

    onShow: function(e) {
        wx.showLoading({
            title: 'loading...',
          })
          let thiz = this
          wx.cloud.callFunction({
              name:"zlogin",
              success(res) {
                  wx.hideLoading()
                  console.log(res)
                  let user = res.result.data.data
                  let p1v = 0
                  let p2v = 0
                  if (user.exp>=0 && user.exp<=1000) {
                    p1v = user.exp/1000*100
                  }else if (user.exp > 1000 && user.exp<=10000) {
                      p1v = 100
                      p2v = user.exp/9000*100
                  }else if (user.exp > 10000) {
                    p1v = 100
                    p2v = 100
                  }
                  thiz.setData({
                      user: user,
                      p1v: p1v,
                      p2v: p2v,
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
                province: '',
                balance: 0,
                point: 0,
                signs: 0,
                signDate: '',
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
        wx.scanCode({
            success (res) {
                console.log(res)
                wx.navigateTo({
                  url: '../scanpay/scanpay?merchantID='+res.result,
                })
            }
        })
        // wx.navigateTo({
        //     url: '../scanpay/scanpay?merchantID=',
        //   })
    },

    vipexperience: function(){
        wx.navigateTo({
            url: '../vipexperience/vipexperience?user='+JSON.stringify(this.data.user),
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