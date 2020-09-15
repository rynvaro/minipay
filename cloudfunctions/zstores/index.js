// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const _ = db.command

    let storeType = event.storeType // 商户类型：1 餐饮 2 娱乐
    let orderType = parseInt(event.orderType) // 排名类型：1 按照人气 2 按照时间
    let isGeo = event.isGeo // 是否按照附近商家查找
    let lat = event.lat
    let lon = event.lon

    console.log("event is: ",event)

    let result = {}
    
    try {
        // 0 是附近商家
        if (storeType != 0) {
            var where =_.and({storeType: _.eq(storeType)})
            if (isGeo) {
                where = where.and({
                    geoPoint: _.geoNear({
                        geometry: db.Geo.Point(lon,lat),
                        maxDistance: 50000,
                        minDistance: 0,
                    })
                })
            }
            if (orderType == 1) {
                result = await db.collection('mstores').where(where).orderBy('orders','desc').get()
            }else if (orderType == 2) {
                result = await db.collection('mstores').where(where).orderBy('createdAt','desc').get()
            }else {
                result = await db.collection('mstores').where(where).get()
            }
        }else {
            let orderBy = 'orders'
            if (orderType == 2) {
                orderBy = 'createdAt'
            }
            result = await db.collection('mstores').where({
                geoPoint: _.geoNear({
                    geometry: db.Geo.Point(lon,lat),
                    maxDistance: 50000,
                })
            }).orderBy(orderBy,'desc').get()
        }

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