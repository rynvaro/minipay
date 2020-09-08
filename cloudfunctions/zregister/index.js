// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var result = {}

  // TODO 冲突
  let inviteCode = Math.random().toString().substr(2,8)
    try {
        result = await db.collection('users').add({
          data: {
              _id: wxContext.OPENID,
              data: event,
              createAt: Date.parse(new Date()),
              updateAt: Date.parse(new Date()),
              inviteCode: inviteCode,
          },
          success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw(err)
          }
      })
    } catch(e) {
        throw(e)
    }

    return result
}