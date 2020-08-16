// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    console.log("event is: ",event)

    const phone = event.phone
    /**
     * 1. 根据手机号获取信息，如果没获取到，则注册，并绑定手机号和当前openid
     * 2. 根据手机号获取信息，如果获取到，比对获取到到信息中到openid 和 当前到openid
     *    2.1 如果openid 和 当前openid 相同，则可以修改
     *    2.2 如果openid 和 当前openid 不同，则只可读取
     * 3. 以上两条规则用户所有到云函数，并且所有到内容都以手机号作为标示。
     */

    var result = {}

    console.log("phone is: ",phone)

    try{
      result = await db.collection("merchants").doc(phone).get()
      // 获取到数据
      if (event.password!=result.data.password) {
        throw("invalidpassword")
      }
    } catch(e) {
      console.log("catched exception: ", e)
      if (e.toString().indexOf("invalidpassword")>=0){
        throw("invalidpassword")
      }
      // 未获取到，注册到数据库中，并绑定手机号和当前openid
      // TODO 要确定是否有其他错误，暂时是先把次错误当作是不存在到错误处理。
      result = await db.collection('merchants').add({
          data: {
              _id: phone,
              openid: wxContext.OPENID,
              phone: phone,
              discount: {
                discountValue: 10,
                timeStart:'请选择开始时间',
                timeEnd:'请选择结束时间'
              },
              dayBi: 0.00,
              balance: 1000,// TODO remove
              orders: [],
              password: event.password,// TODO encrypt
              publishedAt: formatTime(new Date()),
              updatedAt: formatTime(new Date())
          },
          success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw(err)
          }
      })
    }
    
    return result
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