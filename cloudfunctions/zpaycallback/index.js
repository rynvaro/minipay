// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  await db.collection('paycallbacks').add({
    data: event,
    success: res => {
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
    },
    fail: err => {
      console.error('[数据库] [新增记录] 失败：', err)
      throw(err)
    }
  })

  let orderId = event.outTradeNo
  console.log(event)
  console.log("orderid is: ",orderId)
  try {
    const iorder = await db.collection('iorders').doc(orderId).get()
    if (iorder.data.status == 1) {
      return { "errcode": 0 } 
    }
    cloud.callFunction({
      name:"zdorderpay",
      data: {
        storeID: iorder.data.storeId,
        orderId: orderId,
        payby: 1,
        openid: wxContext.OPENID
      },
      success(res) {
          console.log(res)
          return { "errcode": 0 } 
      },
      fail: function(e) {
          console.log(e)
          return { "errcode": 0 } 
      }
  })
  }catch(e) {
    console.log(e)
    return { "errcode": 0 } 
  }


  return { "errcode": 0 }
}