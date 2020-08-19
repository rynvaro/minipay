// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _ = db.command
  
  // 3. 条件查询
  try {
    var query = db.collection("bizs").where(db.command.or(
      [
        {
          title: {
            $regex: '.*' + event.q,
            $options: 'i'
          }
        },
        {
          desc: {
            $regex: '.*' + event.q,
            $options: 'i'
          }
        }
      ]
    ))
    return await query.orderBy('updatedAt','desc').get()
  } catch (e) {
    console.log(e)
  }
}