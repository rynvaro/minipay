// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let status = event.status
  let q = event.q

  let pageSize = event.pageSize
  let currentPage = event.currentPage

  const _ = db.command
  console.log(status == 0, status)

  var where = _.and({openid: _.eq(wxContext.OPENID)})
  if (status != 0) {
    where = where.and({status: _.eq(parseInt(status))})
  }

  if (q != '') {
    where = where.and({storeName: db.RegExp({regexp: '.*'+q +'.*', options: 1})})
  }

  const result = await db.collection('iorders').where(where).orderBy('timestamp','desc').skip((currentPage-1)*pageSize).limit(pageSize).get()

  if (result.data.length == pageSize) {
    result.hasNext = true
    result.currentPage = currentPage + 1
  }else {
    result.hasNext = false
    result.currentPage = currentPage + 1
  }

  return result
}