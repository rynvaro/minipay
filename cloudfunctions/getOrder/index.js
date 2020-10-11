// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {

  var order = {}  
  try {
    order = await db.collection("iorders").doc(event.orderId).get()
  }catch(e) {
      throw(e)
  }

  return order
}