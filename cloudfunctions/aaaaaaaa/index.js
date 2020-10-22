// 云函数入口文件
const cloud = require('wx-server-sdk')

const axios = require('axios')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})
async function getWeather() {

    console.log('start getWeather')
  
    var data = {}
  
    try {

      let params = {
        "touser":"osP5kwiG6nOSI9t6gmAULyh8_40w",
        "template_id":"WCk1obq17BXnnr5FYU2YM-nfjt-oMxvgFreMDsmGBak",
        "miniprogram":{
          "appid":"wx9b588b2b3f090400",
        },          
        "data":{
                "first": {
                    "value":"收到新订单",
                    "color":"#173177"
                },
                "keyword1":{
                    "value":"商家名称",
                    "color":"#173177"
                },
                "keyword2": {
                    "value":"39.8元",
                    "color":"#173177"
                },
                "keyword3": {
                    "value":"易",
                    "color":"#173177"
                },
                  "keyword4": {
                    "value":"微信支付",
                    "color":"#173177"
                },
                "keyword5": {
                    "value":"无",
                    "color":"#173177"
                },
                "remark":{
                    "value":"请及时处理",
                    "color":"#173177"
                }
        }
    }
  
      var res = await axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=38_g477FAmfZkj00VwMngC8Bj-_7d5dV4WPxy7VpMbKHO5WsT5sYMrJFM2nl0bbj_OY1tBxWEbL5xacp2arSUyrizhTbf5tIj5JzWIq3v8pO-f9barQXoqedDn5XrkmMXXbsKIjd7fJ_RD67iU1GDEcADAURS',params)
  
      data = res.data
  
    } catch (err) {
      console.log(err)
    }
    return data
  }
// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const _ = db.command

    var date = new Date()
    date.setHours(16,0,0)
    console.log(date.getTime())
    let offset = date.getTimezoneOffset()


    console.log(offset)

    return await db.collection('users').where({
      'data.point': _.gte(700)
    }).get()



    // const data = getWeather()
    // return data

    // let tp = event.tp
    // if (tp == 'list') {
    //     let count = await db.collection('mstores').count()
    //     let currentPage = event.currentPage
    //     let pageSize = 50
    //     let totalCount = count.total
    
    //     const results = await db.collection('mstores').skip((currentPage-1)*pageSize).limit(pageSize).orderBy('createdAt','desc').get()
    
    //     return {
    //         data: results.data,
    //         totalCount: totalCount,
    //         currentPage: currentPage,
    //         pageSize: pageSize,
    //     }
    // }

    // if (tp == 'update') {
    //     let thumbnail = event.thumbnail
    //     let id = event.storeId
    //     return await db.collection('mstores').doc(id).update({
    //         data: {
    //             thumbnail: thumbnail
    //         }
    //     })
    // }

    // if (tp == 'addmerchant') {
    //     return await db.collection('merchants').add({
    //         data: {
    //             balance: event.balance,
    //             bank: event.bank,
    //             createdAt: event.createdAt,
    //             updatedAt: event.updatedAt,
    //             bankcard: event.merchantBankCard,
    //             name: event.merchantName,
    //             phone: event.merchantPhone,
    //             openid: event.openid,
    //             password: event.password,
    //         }
    //     })
    // }

    return {}
    
}