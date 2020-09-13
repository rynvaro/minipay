// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const userData = await db.collection('users').doc(wxContext.OPENID).get()
    let user = userData.data.data
    let level = user.level
    
    let lat = event.lat
    let lon = event.lon
 
    let result = {}
    const _ = db.command

    const plates =  await db.collection('plates').get()
    for (var i = 0; i < plates.data.length; i++) {
        plate = plates.data[i]
        let ids = []
        for (var j = 0; j < plate.items.length; j++ ) {
            ids.push(plate.items[j].storeId)
        }
        let res = await db.collection('mstores').where({_id: _.in(ids)}).get()

        for (var x = 0; x<res.data.length; x++) {

            var realDiscount = res.data[x].discount
            if (realDiscount <= 9) {
                let delta = 0.0
                if ( level == 1 ) {
                    delta = 0.5
                }else if (level == 2) {
                    delta = 0.3
                }
                realDiscount = realDiscount + delta
            }

            plate.items[x].discount = realDiscount
        }
    }


    result.plates = plates.data

    let internalPlates = []


    const foodStores = await db.collection('mstores').where({storeType: 1}).orderBy('orders','desc').limit(10).get()
    let internalPlateFood = {items: []}
    for (var i = 0; i< foodStores.data.length; i++) {
        foodStore = foodStores.data[i]
        var realDiscount = foodStore.discount
        if (realDiscount <= 9) {
            let delta = 0.0
            if ( level == 1 ) {
                delta = 0.5
            }else if (level == 2) {
                delta = 0.3
            }
            realDiscount = realDiscount + delta
        }
        if (i == 0) {
            internalPlateFood.type = 1 // foods
            internalPlateFood.title = "食在上饶"
            internalPlateFood.headerStoreId = foodStore._id
            internalPlateFood.headerImage = foodStore.storeImages[0]
        }else {
            var item = {
                storeId: foodStore._id,
                image: foodStore.storeImages[0],
                discount: realDiscount,
                desc: foodStore.storeDesc,
            }
            internalPlateFood.items.push(item)
        }
    }
    internalPlates.push(internalPlateFood)


    // 娱乐
    const eStores = await db.collection('mstores').where({storeType: 2}).orderBy('orders','desc').limit(10).get()

    let internalPlateE = {items: []}
    for (var i = 0; i< eStores.data.length; i++) {
        eStore = eStores.data[i]
        var realDiscount = eStore.discount
        if (realDiscount <= 9) {
            let delta = 0.0
            if ( level == 1 ) {
                delta = 0.5
            }else if (level == 2) {
                delta = 0.3
            }
            realDiscount = realDiscount + delta
        }
        if (i == 0) {
            internalPlateE.type = 2 // entertainments
            internalPlateE.title = "玩乐途游"
            internalPlateE.headerStoreId = eStore._id
            internalPlateE.headerImage = eStore.storeImages[0]
        }else {
            var item = {
                storeId: eStore._id,
                image: eStore.storeImages[0],
                discount: realDiscount,
                desc: eStore.storeDesc,
            }
            internalPlateE.items.push(item)
        }
    }
    internalPlates.push(internalPlateE)


    // 附近
    const nearStores = await db.collection('mstores').where({
        geoPoint: _.geoNear({
            geometry: db.Geo.Point(lon,lat),
            maxDistance: 50000,
        })
    }).orderBy('createdAt','desc').limit(10).get()

    let internalPlateNear = {items: []}
    for (var i = 0; i< nearStores.data.length; i++) {
        nearStore = nearStores.data[i]
        var realDiscount = nearStore.discount
        if (realDiscount <= 9) {
            let delta = 0.0
            if ( level == 1 ) {
                delta = 0.5
            }else if (level == 2) {
                delta = 0.3
            }
            realDiscount = realDiscount + delta
        }
        if (i == 0) {
            internalPlateNear.type = 0 // nearby
            internalPlateNear.title = "附近商家"
            internalPlateNear.headerStoreId = nearStore._id
            internalPlateNear.headerImage = nearStore.storeImages[0]
        }else {
            var item = {
                storeId: nearStore._id,
                image: nearStore.storeImages[0],
                discount: realDiscount,
                desc: nearStore.storeDesc,
            }
            internalPlateNear.items.push(item)
        }
    }
    internalPlates.push(internalPlateNear)

    result.internalPlates = internalPlates
    return result
}