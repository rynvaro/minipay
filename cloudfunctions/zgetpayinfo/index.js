// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

const envId = "dev-osmu3"
const subMchId = "1601917642"

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  console.log("event is: ",event)

  let id = (Math.random().toString().substr(2)+Math.random().toString().substr(2)+Math.random().toString().substr(2)).substr(0,32)
  let nonceStr = (Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)).substr(0,32).toUpperCase()
  let depositAmount = event.depositAmount*100

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

  console.log("deposit is: ",deposit)

  console.log("evn is: ",cloud.DYNAMIC_CURRENT_ENV)

  const res = await cloud.cloudPay.unifiedOrder({
    "body" : "柒号生活-充值",
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
  // const result = await db.runTransaction(async transaction => {
  //   console.log("00010100101010")
  //   try {
      
  //     console.log("33333333")
      
  //   }catch(e) {
  //     console.log("error is: ",e)
  //     await transaction.rollback(-100)
  //   }
  // })

  
}