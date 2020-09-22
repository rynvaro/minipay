// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let lat = event.lat
    let lon = event.lon

    let result = {}
    
    try {

        const hisSearch = await db.collection('his_searchs').where({openid: wxContext.OPENID, q: event.q}).get()

        if (hisSearch.data.length <=0 ) {
          db.collection('his_searchs').add({
            data: {
                openid: wxContext.OPENID,
                q: event.q,
                t: Date.parse(new Date())
            },
            success: res => {
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              console.error('[数据库] [新增记录] 失败：', err)
              throw(err)
            }
          })
        }else {
          db.collection('his_searchs').doc(hisSearch.data[0]._id).update({
            data: {
                t: Date.parse(new Date())
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

        const hotSearch = await db.collection('hot_searchs').where({q: event.q}).get()

        if (hotSearch.data.length <=0) {
          db.collection('hot_searchs').add({
            data: {
                openid: wxContext.OPENID,
                q: event.q,
                times: 1,
                t: Date.parse(new Date())
            },
            success: res => {
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              console.error('[数据库] [新增记录] 失败：', err)
              throw(err)
            }
          })
        }else {
          db.collection('hot_searchs').doc(hotSearch.data[0]._id).update({
            data: {
                times: hotSearch.data[0].times + 1,
                t: Date.parse(new Date())
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

        result = await db.collection("mstores").where(db.command.or(
            [
              {
                storeName: {
                  $regex: '.*' + event.q,
                  $options: 'i'
                }
              },
              {
                storeDesc: {
                  $regex: '.*' + event.q,
                  $options: 'i'
                }
              }
            ]
          )).get()

        for (var i = 0; i < result.data.length; i++){
            let dis = distance(result.data[i].latitude,result.data[i].longitude,lat,lon)
            result.data[i].distance = dis.toFixed(2)+'km'
        }

    }catch(e) {
        throw(e)
    }

    return result
}

function distance(la1, lo1, la2, lo2){
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137; //地球半径
    s = Math.round(s * 10000) / 10000;
    return s
}