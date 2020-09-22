//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'dev-osmu3',
        env: 'release-8tcge',
        traceUser: true,
      })
    }

    const systemInfo = wx.getSystemInfoSync();
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    if (systemInfo.system.indexOf('iOS') > -1) {
      this.globalData.navBarHeight = 44
    }else {
      this.globalData.navBarHeight = 48
    }
  
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
  },

  // 数据都是根据当前机型进行计算，这样的方式兼容大部分机器
  globalData: {
    statusBarHeight: 0, // 状态栏高度
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuBotton: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
    storeID: '', // 商家后台登录后的店铺ID
    viplevel: 1,
}
})
