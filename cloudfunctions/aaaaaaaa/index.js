// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const result = await cloud.openapi.customerServiceMessage.send({
            touser: 'oUyaw4jq_vfcGE91SiR5hPokx0oo',
            msgtype: 'text',
            text: {
              content: '柒号生活到账10元'
            }
          })
        return result
      } catch (err) {
        return err
      }

    return await db.collection('todos').add({data:{
        status: 1,
        content: 'haha',
        _openid: wxContext.OPENID,
    }})
}