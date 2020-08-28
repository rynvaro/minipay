// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const res = await cloud.cloudPay.unifiedOrder({
    "body" : "小店-超市",
    "outTradeNo" : "1217752501201407033233368018",
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1601917642",
    "totalFee" : 1,
    "envId": "dev-osmu3",
    "functionName": "zpaycallback"
  })

  console.log("00000-----1--1---")
  console.log(res)

  return res
}