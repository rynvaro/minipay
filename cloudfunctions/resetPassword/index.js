// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {

  try {
    await db.collection('merchants').doc(event.phone).update({
      data: {
          password: event.password,
          updatedAt: new Date()
      },
      success: res => {
          console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
          console.error('[数据库] [更新记录] 失败：', err)
          throw("update error")
      }
  })
  }catch(e) {
    throw(e)
  }

  return {}
}