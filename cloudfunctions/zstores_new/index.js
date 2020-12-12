// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const _ = db.command

    let orderType = parseInt(event.orderType) // 排名类型：1 按照人气 2 按照时间
    let isGeo = event.isGeo // 是否按照附近商家查找
    let lat = event.lat
    let lon = event.lon
    
    let pageSize = event.pageSize
    let currentPage = event.currentPage
    let viplevel = event.viplevel

    console.log("event is: ",event)

    let result = {}
    
    try {

        // // 获取默认配置
        // const percentageConfig = await db.collection('config').doc('percentageconfig').get()
        // console.log("ssis: ", percentageConfig)
        // var defaultPercent = percentageConfig.data.default
        // var addtionalPercent = percentageConfig.data.v1addtional
        // switch (viplevel) {
        //     case 1:
        //         addtionalPercent = percentageConfig.data.v1addtional
        //         break
        //     case 2:
        //         addtionalPercent = percentageConfig.data.v2addtional
        //         break
        //     case 3:
        //         addtionalPercent = percentageConfig.data.v3addtional
        //         break
        // }

        let v1discount = 0.5
        let v2discount = 0.3
        let v3discount = 0
        var addtionalDiscount = 0.5
        switch (viplevel) {
            case 0:
                addtionalDiscount = v1discount
                break
            case 1:
                addtionalDiscount = v1discount
                break
            case 2:
                addtionalDiscount = v2discount
                break
            case 3:
                addtionalDiscount = v3discount
                break
        }


        var where =_.and({deleted: 0})
        where = where.and({
            geoPoint: _.geoNear({
                geometry: db.Geo.Point(lon,lat),
                maxDistance: 5000000,
                minDistance: 0,
            })
        })
        result = await db.collection('mstores').where(where).skip((currentPage-1)*pageSize).limit(pageSize).get()
        if (result.data.length == pageSize) {
            result.hasNext = true
            result.currentPage = currentPage + 1
        }else {
            result.hasNext = false
            result.currentPage = currentPage + 1
        }
        result.orderType = orderType
        result.isGeo = isGeo

        for (var i = 0; i < result.data.length; i++){
            let dis = distance(result.data[i].latitude,result.data[i].longitude,lat,lon)
            result.data[i].distance = dis.toFixed(2)+'km'

            var percent = (10 - result.data[i].discount - addtionalDiscount) * 10
            if (result.data[i].discount > 9) {
                percent =(10 - result.data[i].discount) * 10
            }
            console.log(result.data[i].discount, addtionalDiscount, percent,10 - result.data[i].discount - addtionalDiscount)
            // if (!result.data[i].percent) {
            //     result.data[i].percent = defaultPercent
            // }
            // result.data[i].percent += addtionalPercent
            result.data[i].percent = parseFloat(percent.toFixed(2))
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