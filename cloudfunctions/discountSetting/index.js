// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    try {
      merchant = await db.collection("merchants").doc(event.phone).get()
      if  (openid!=merchant.data.openid) {
        throw("permission denied")
      }
      await db.collection('merchants').doc(event.phone).update({
        data: {
          discount:{
              discountValue: event.discount,
              timeStart: event.timeStart,
              timeEnd: event.timeEnd, 
          },
          updatedAt: new Date()
        },
        success: res => {
          console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          console.error('[数据库] [更新记录] 失败：', err)
          throw("update failed")
        }
      })
    }catch(e) {
      throw(e)
    }

    return {}
}