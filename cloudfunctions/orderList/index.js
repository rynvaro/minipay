// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {

  let q = event.q
  let status = event.status
  let storeID = event.storeID
  let type = event.type

  const _ = db.command

  console.log(status == 0, status)

  var where = _.and({storeId: _.eq(storeID)})
  if (status != 0) {
    where = where.and({status: _.eq(parseInt(status))})
  }

  if (type == 'day') {
    let now = new Date()
    now.setHours(0, 0, 0, 0)
    let today = now.getTime()
    where = where.and({timestamp: _.gte(today)})
  }

  if (q != '') {
    where = where.and({title: db.RegExp({regexp: '.*'+q +'.*', options: 1})})
  }

  var result = await db.collection('orders').where(where).get()
  
  return result
}