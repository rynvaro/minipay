// miniprogram/pages/indexpage/indexpage.js
const app = getApp()
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
        
        banners: [],


        stores: [],
        // page
        pageSize: 10,
        currentPage: 1,
        hasNext: false,
        orderType: 0,
        storeType: 4,
        isGeo: true,


        // button mask for register
        login: false,
        maskHidden: false,

        tipsHidden: true,

        user: {},
    },

    vcenter: function() {
        wx.navigateTo({
          url: '../index/index',
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
              expTotal: 1001,
              city: e.detail.userInfo.city,
              country: e.detail.userInfo.country,
              gender: e.detail.userInfo.gender,
              language: e.detail.userInfo.language,
              province: e.detail.userInfo.province,
              province: '',
              balance: 0,
              point: 0,
              signs: 0,
              signDate: 0,
              sevenSigns: 0,
              phone: '',
              payTimes: 0,
              level: 1,
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
                  maskHidden: true,
                  redpackShow: true,
                  stores: [],
                  currentPage: 1,
              })
              thiz.onShow()
          },
          fail: function(e) {
            wx.hideLoading()
            console.log(e)
          }
      })
  },

    scan: function(e) {
        wx.scanCode({
            success (res1) {
                console.log(res1)
                wx.cloud.callFunction({
                  name:"zcheckpopup",
                  data: {
                    id: res1.result,
                  },
                  success(res) {
                      console.log("res is: ", res)
                      wx.hideLoading()
                      wx.navigateTo({
                        url: '../orderv2/orderv2?storeID='+res1.result + '&canUseBalance='+ res.result.canUseBalance
                      })
                  },
                  fail: function(e) {
                    console.log(e.errMsg)
                    wx.hideLoading()
                    wx.showModal({
                      title: '提示',
                      content: '请扫描7号生活二维码'
                    })
                  }
              })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加smile
     * 
     */
    onLoad: function (options) {
    },

    tipsConfirm: function(e){
      wx.openSetting({
        withSubscriptions: true,
      })
    },

    tipsCancel: function(e) {

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
      wx.showLoading({
        title: 'loading...',
      })
      let thiz = this
      wx.getLocation({
        type: 'wgs84',
        success (res) {
            app.globalData.location = res
            // //////// 
            wx.showLoading({
              title: 'loading...',
            })
            wx.cloud.callFunction({
                name:"zlogin",
                success(res) {
                    wx.hideLoading()
                    console.log(res)
                    let user = res.result.data.data
                    app.globalData.viplevel = user.level
                    thiz.setData({
                        user: user,
                        login: true,
                        maskHidden: true,
                    })
                    thiz.setData({stores: [], currentPage: 1})
                    listStores(thiz,1,false,thiz.data.pageSize, thiz.data.currentPage)
                },
                fail: function(e) {
                  wx.hideLoading()
                  console.log(e)
                  thiz.setData({stores: [], currentPage: 1})
                  listStores(thiz,1,false,thiz.data.pageSize, thiz.data.currentPage)
                }
            })
            // ////////
        },
        fail(res) {
            wx.showModal({
              title: '提示',
              content: '请允许获取位置信息',
              success (rr) {
                if (rr.confirm) {
                  wx.openSetting({
                    withSubscriptions: true,
                  })
                } else if (rr.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
        }
    })



      wx.cloud.callFunction({
          name:"zgetconfig",
          data: {
            confid: 'indexbannerconfig',
          },
          success(res) {
              console.log(res)
              thiz.setData({
                  banners: res.result.data.items,
              })
          },
          fail: function(e) {
              console.log(e)
          }
      })
        
    },

    order: function(options){
      console.log(options)
      wx.navigateTo({
        url: '../orderv2/orderv2?storeID='+options.currentTarget.dataset.id + '&canUseBalance=true'
      })
    },

    usage: function(options){
      var index = options.currentTarget.dataset.index
      wx.navigateTo({
        url: '../usage/usage?contentlink='+this.data.banners[index].contentlink,
      })
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
      if (this.data.hasNext) {
        wx.showLoading({
          title: 'loading...',
        })
        listStores(this, this.data.orderType, this.data.isGeo, this.data.pageSize, this.data.currentPage)
      }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})

/**
 * 
 * @param {*} thiz this
 * @param {*} orderType 排序类型：1 按照人气 2 按照时间 0 不排序
 * @param {*} isSearch  是否是搜索
 * @param {*} q   搜索关键字
 * @param {*} isGeo 是否是Geo
 */
function listStores(thiz, orderType, isGeo, pageSize, currentPage){
    console.log("orderType: ", orderType)
    console.log("isGeo: ", isGeo)
    console.log("storeType: ", thiz.data.storeType)
    console.log("currentPage: ", currentPage)
    console.log("pageSize: ", pageSize)
    wx.cloud.callFunction({
        name:"zstores_new",
        data: {
            storeType: thiz.data.storeType,
            orderType: orderType,
            isGeo: isGeo,
            lat: app.globalData.location.latitude,
            lon: app.globalData.location.longitude,
            pageSize: pageSize,
            currentPage: currentPage,
            viplevel: thiz.data.user.level,
        },
        success(res) {
            console.log(res)
            thiz.setData({
                stores: thiz.data.stores.concat(res.result.data),
                hasNext: res.result.hasNext, 
                currentPage: res.result.currentPage,
                orderType: res.result.orderType,
                isGeo: res.result.isGeo,
              })
            wx.hideLoading()
        },
        fail: function(e) {
            console.log(e.errMsg)
            wx.hideLoading()
        }
    })
  }