// pages/bizreg/bizreg.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    files:[],
    isUpdate:false,
    // isCompletelyNew: false,
    id: '',
    title:'',
    desc:'',
    price:'9',
    originalPrice:'',
    wxid:'',
    needUpdateImage: false,
    location:{
      name:'',
      address:'选择位置',
      longitude:'',
      latitude:'',
      located:false,
    },
    publishClicked:false,
    array:[1,2,3,4,5,6,7,8,9],
    index:8
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '添加商家',
    })

    this.setData({
      files: wx.getStorageSync("files")
    })
    var g = wx.getStorageSync("edit_goods")
    if (g){
      this.setData({
        id: g._id,
        title: g.title,
        desc: g.desc,
        files: g.images,
        // location: g.location,
        // isCompletelyNew: g.isNew,
        price: g.price,
        originalPrice: g.originalPrice,
        wxid: g.wxid,
        isUpdate:true
      })
    }
    
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      price: parseInt(e.detail.value)+1
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

  },
  /**
   * 自定义函数
   */

  deleteImg: function(e){
    var index = e.currentTarget.dataset.index; 
    var files = this.data.files;
    files.splice(index, 1);
    this.setData({
      files: files,
      needUpdateImage:true
    });
  },

  chooseImages: function () {
    var that = this
    wx.chooseImage({
      count: 9-that.data.files.length,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        var files = []
        if (!that.data.files){
          files = res.tempFilePaths
        }else{
          files = that.data.files.concat(res.tempFilePaths)
        }
        that.setData({
          files:files,
          needUpdateImage:true
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

  // completelyNew:function() {
  //   this.setData({ isCompletelyNew: !this.data.isCompletelyNew })
  // },

  selectLocation: function(){
    var that = this
    wx.chooseLocation({
      success: function(res) {
        console.log(res)
        that.setData({location:{
          name: res.name,
          address: res.address,
          longitude: res.longitude,
          latitude: res.latitude,
          located:true,
        }})
      },
      fail:function(){
        wx.showToast({
          title: '获取位置失败！',
        })
      }
    })
  },

  /**
   * 设置值
   */
  setTitle: function(e){
    this.setData({
      title:e.detail.value
    })
  },

  setDesc: function (e) {
    this.setData({
      desc: e.detail.value
    })
  },

  setPrice: function(e) {
    this.setData({
      price:e.detail.value
    })
  },

  setOriginalPrice: function (e) {
    this.setData({
      originalPrice: e.detail.value
    })
  },
  setwxid: function (e) {
    this.setData({
      wxid: e.detail.value
    })
  },

  // 发布
  publish: function () {

    var that = this

    if (this.data.publishClicked){
      // wx.showToast({
      //   title: '请不要重复发布',
      // })
      return
    }

    that.setData({
      publishClicked: true
    })
    setTimeout(function(){
      that.setData({
        publishClicked:false
      })
    },2000)

    // check param
    if (!this.data.title) {
      wx.showToast({
        title: '请输入店铺名称',
      })
      return
    }

    if (!this.data.desc) {
      wx.showToast({
        title: '请输入店铺描述',
      })
      return
    }

    if (!this.data.price) {
      wx.showToast({
        title: '请输入折扣策略',
      })
      return
    }

    if (!this.data.originalPrice) {
      wx.showToast({
        title: '请输入经营许可',
      })
      return
    } 

    if (this.data.files.length < 1 ) {
      wx.showToast({
        title: '请至少上传一张图片',
      })
      return
    }

    if (!this.data.location.located){
      wx.showToast({
        title: '请选择您的位置',
      })
      return
    }

    var that = this
    var files = []

    wx.showLoading({
      title: '发布中...',
    })
    

    // 1. 上传图片
    var promise = Promise.all(this.data.files.map((filePath, index) => {

      if (filePath.startsWith("cloud")){
        return new Promise(function(resolve, reject){
          resolve(filePath)
        })
      }

      var cloudPath = 'images/' + wxuuid() + filePath.match(/\.[^.]+?$/)[0]
      
      return new Promise(function (resolve, reject) {
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            resolve(res.fileID)
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.hideLoading()
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          }
        });
      });
    }));

    promise.then(function(results){
      wx.cloud.callFunction({
        name: "publish",
        data:{
          id:that.data.id,
          title: that.data.title,
          desc: that.data.desc,
          images: results,
          price: that.data.price,
          originalPrice: that.data.originalPrice,
          wxid:that.data.wxid,
          location: that.data.location
        },
        success(res) {
          wx.hideLoading()
          console.log("发布："+JSON.stringify(res))
          var title = '发布成功'
          if (!res.result) {
            title = '发布失败'
          }
          wx.showToast({
            title: title,
          })
          wx.navigateBack({})
        },
        fail:function(){
          wx.hideLoading()
          wx.showToast({
            title: '发布失败s',
          })
        }
      })
    })
  },
})


const wxuuid = function () {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid

}