// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // // 1. 获取用户信息
  // const users = await db.collection("users").where({ _openid: wxContext.OPENID}).get()

  // // 2. 提取opengid
  // var opengids = []
  // for (i = 0; i < users.data.length; i++) {
  //   for (j = 0; j < users.data[i].opengids.length; j++) {
  //     opengids = opengids.concat(users.data[i].opengids[j])
  //   }
  // }

  // 3. 发布到或者更新
  var result
  if (!event.id) {
    result = await db.collection('bizs').add({
      data: {
        title: event.title,
        desc: event.desc,
        images: event.images,
        price: event.price,
        originalPrice: event.originalPrice,
        wxid: event.wxid,
        openid:wxContext.OPENID,
        location:event.location,
        publishedAt: formatTime(new Date()),
        updatedAt: formatTime(new Date())
      },
      success: res => {
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  }else {
    result = await db.collection('goods').doc(event.id).update({
      data: {
        title: event.title,
        desc: event.desc,
        images: event.images,
        price: event.price,
        originalPrice: event.originalPrice,
        opengids: opengids,
        wxid: event.wxid,
        updatedAt: formatTime(new Date())
      },
      success: res => {
        console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  }

  return result.errMsg == 'collection.add:ok' || result.errMsg == 'collection.add:ok'
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}