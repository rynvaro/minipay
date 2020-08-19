// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var result = await db.collection("codes").doc(event.codeID).get()
    if (result.data.code!=event.code) {
      throw("invalid code")
    }
    console.log(Date.parse(new Date())/10-result.data.time/10)
    console.log(Date.parse(new Date()))
    console.log(result.data.time)
    if (Date.parse(new Date())/1000-result.data.time/1000 > 10 * 60) {
      throw("code expired")
    }

    // 验证通过，删除code
    await db.collection("codes").doc(event.codeID).remove()
  } catch(e) {
      throw(e)
  }

  return {}
}