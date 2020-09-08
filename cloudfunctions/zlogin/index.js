// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var result = {}

    try {
        result = await db.collection("users").doc(wxContext.OPENID).get()

        const redpacks = await db.collection('redpacks').get()
        redpack = redpacks.data[0]
        result.redpackValue = redpack.value
    } catch(e) {
        throw(e)
    }

    return result
}