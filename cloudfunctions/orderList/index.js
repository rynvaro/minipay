// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  console.log("xxxx-x-x-x-")
  console.log(wxContext.OPENID)
  console.log('event is: ',event)

  let q = event.q
  let status = event.status
  let storeID = event.storeID
  let type = event.type

  let pageSize = event.pageSize
  let currentPage = event.currentPage

  const _ = db.command

  console.log(status == 0, status)

  var where = _.and({storeId: _.eq(storeID),status: _.eq(1)})
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

  var result = await db.collection('iorders').where(where).orderBy('timestamp','desc').skip((currentPage-1)*pageSize).limit(pageSize).get()
  
  if (result.data.length == pageSize) {
      result.hasNext = true
      result.currentPage = currentPage + 1
  }else {
      result.hasNext = false
      result.currentPage = currentPage + 1
  }

  return result
}