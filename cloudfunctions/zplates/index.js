// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log("wxContext: ", wxContext)
    console.log("event is: ",event)
    let level = event.level
    let lat = event.lat
    let lon = event.lon

    // update user location info
    db.collection('users').doc(wxContext.OPENID).update({
        data: {
            data: {
                lat: event.lat,
                lon: event.lon,
            }
        }
    })
 
    const _ = db.command

    const plates =  await db.collection('plates').where({status: 1}).orderBy('index','asc').get()
    for (var i = 0; i < plates.data.length; i++) {
        for (var j = 0; j < plates.data[i].items.length; j++) {
            var realDiscount = plates.data[i].items[j].discount
            if (realDiscount <= 9) {
                let delta = 0.0
                if ( level == 1 ) {
                    delta = 0.5
                }else if (level == 2) {
                    delta = 0.3
                }
                realDiscount = realDiscount + delta
            }
            plates.data[i].items[j].discount = realDiscount
        }

        if (plates.data[i].title == '附近商家'){
            if (lat !=0 && lon !=0 ){
                // 附近
                const nears = await db.collection('mstores').where({
                    deleted: 0,
                    geoPoint: _.geoNear({
                        geometry: db.Geo.Point(lon,lat),
                        maxDistance: 50000,
                    })
                }).orderBy('createdAt','desc').limit(4).get()

                for (var x = 0; x < nears.data.length; x ++) {
                    near = nears.data[x]
                    var realDiscount = near.discount
                    if (realDiscount <= 9) {
                        let delta = 0.0
                        if ( level == 1 ) {
                            delta = 0.5
                        }else if (level == 2) {
                            delta = 0.3
                        }
                        realDiscount = realDiscount + delta
                    }
                    near.discount = realDiscount
                    var image = ''
                    if (near.thumbnail) {
                        image = near.thumbnail
                    }
                    plates.data[i].items.push({storeId: near._id, desc: near.storeDesc, discount: near.discount, image: image ,title: near.storeName})
                }
            }
        }
    }

    return plates
}