// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const userData = await db.collection('users').doc(wxContext.OPENID).get()
    let user = userData.data.data
    let exp = user.exp
    
    

    let lat = event.lat
    let lon = event.lon
 
    let result = {}
    const _ = db.command

    const plates =  await db.collection('plates').get()
    result.plates = plates.data

    let internalPlates = []


    const foodStores = await db.collection('stores').where({storeType: 1}).orderBy('sales','desc').limit(10).get()
    let internalPlateFood = {items: []}
    for (var i = 0; i< foodStores.data.length; i++) {
        foodStore = foodStores.data[i]
        var realDiscount = foodStore.discount.discountValue
        if (realDiscount <= 9) {
            let delta = 0.0
            if ( exp < 1000 ) {
                delta = 0.5
            }else if (exp >= 1000 && exp <10000) {
                delta = 0.3
            }
            realDiscount = realDiscount + delta
        }
        if (i == 0) {
            internalPlateFood.type = 1 // foods
            internalPlateFood.title = "食在上饶"
            internalPlateFood.headerStoreId = foodStore._id
            internalPlateFood.headerImage = foodStore.data.data.storeImage
        }else {
            var item = {
                storeId: foodStore._id,
                image: foodStore.data.data.storeImage,
                discount: realDiscount,
                desc: foodStore.desc,
            }
            internalPlateFood.items.push(item)
        }
    }
    internalPlates.push(internalPlateFood)


    // 娱乐
    const eStores = await db.collection('stores').where({storeType: 2}).orderBy('sales','desc').limit(10).get()

    let internalPlateE = {items: []}
    for (var i = 0; i< eStores.data.length; i++) {
        eStore = eStores.data[i]
        var realDiscount = eStore.discount.discountValue
        if (realDiscount <= 9) {
            let delta = 0.0
            if ( exp < 1000 ) {
                delta = 0.5
            }else if (exp >= 1000 && exp <10000) {
                delta = 0.3
            }
            realDiscount = realDiscount + delta
        }
        if (i == 0) {
            internalPlateE.type = 2 // entertainments
            internalPlateE.title = "玩乐途游"
            internalPlateE.headerStoreId = eStore._id
            internalPlateE.headerImage = eStore.data.data.storeImage
        }else {
            var item = {
                storeId: eStore._id,
                image: eStore.data.data.storeImage,
                discount: realDiscount,
                desc: eStore.desc,
            }
            internalPlateE.items.push(item)
        }
    }
    internalPlates.push(internalPlateE)


    // 附近
    const nearStores = await db.collection('stores').where({
        geoPoint: _.geoNear({
            geometry: db.Geo.Point(lon,lat),
            maxDistance: 50000,
        })
    }).orderBy('publishedAt','desc').limit(10).get()

    let internalPlateNear = {items: []}
    for (var i = 0; i< nearStores.data.length; i++) {
        nearStore = nearStores.data[i]
        var realDiscount = nearStore.discount.discountValue
        if (realDiscount <= 9) {
            let delta = 0.0
            if ( exp < 1000 ) {
                delta = 0.5
            }else if (exp >= 1000 && exp <10000) {
                delta = 0.3
            }
            realDiscount = realDiscount + delta
        }
        if (i == 0) {
            internalPlateNear.type = 0 // nearby
            internalPlateNear.title = "附近商家"
            internalPlateNear.headerStoreId = nearStore._id
            internalPlateNear.headerImage = nearStore.data.data.storeImage
        }else {
            var item = {
                storeId: nearStore._id,
                image: nearStore.data.data.storeImage,
                discount: realDiscount,
                desc: nearStore.desc,
            }
            internalPlateNear.items.push(item)
        }
    }
    internalPlates.push(internalPlateNear)

    result.internalPlates = internalPlates
    return result
}