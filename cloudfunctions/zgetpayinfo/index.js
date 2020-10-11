// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// TODO 环境ID
// const envId = "dev-osmu3"
const envId = "release-8tcge"
const subMchId = "1601917642"

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const user = await db.collection('users').doc(wxContext.OPENID).get()

  let id = (Math.random().toString().substr(2)+Math.random().toString().substr(2)+Math.random().toString().substr(2)).substr(0,32)
  let nonceStr = (Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)).substr(0,32).toUpperCase()
  let depositAmount = event.depositAmount*100
  let body = event.body

  const deposit = await db.collection('deposits').add({
    data: {
      _id: id,
      opendi: wxContext.OPENID,
      depositAmount: depositAmount,
      nonceStr: nonceStr,
      status: 0,
      timestamp: Date.parse(new Date()),
    },
    success: res => {
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
    },
    fail: err => {
      console.error('[数据库] [新增记录] 失败：', err)
      console.log("error1 is: ",e)
      throw(e)
    }
  })

  const res = await cloud.cloudPay.unifiedOrder({
    "body" : body,
    "outTradeNo" : id,
    "spbillCreateIp" : event.ip,
    "subMchId" : subMchId,
    "totalFee" : depositAmount, // 单位 分
    "envId": envId,
    "functionName": "zpaycallback",
    "nonceStr": nonceStr,
    "tradeType":"JSAPI"
  })

  return {deposit,res}
}