// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let storeID = event.storeID
    let viplevel = event.level

    let tp = ''
    if (event.tp) {
        tp = event.tp
    }

    var result = {}

    try {
        const store = await db.collection('mstores').doc(storeID).get()

        let delta = 0.0
        if (store.data.discount <=9) {
            if ( viplevel == 1 || viplevel == 0) {
                delta = 0.5
            }else if ( viplevel == 2) {
                delta = 0.3
            }
        }
        // 不参与平台抽成
        if(store.data.norake) {
            delta = 0
        }

        let realDiscount = store.data.discount + delta
        let percent = parseFloat(((10 - realDiscount) * 10).toFixed(2))

        const coupons = await db.collection('icoupons').where({openid: wxContext.OPENID, status: 0}).get()

        const rules = await db.collection('couponrules').where({type: 'consumption'}).orderBy('threshold','asc').limit(1).get()
        
        result = {
            data: {
                storeName: store.data.storeName,
                productImage: store.data.productImages[0],
                storeImage: store.data.storeImages[0],
                realDiscount: realDiscount,
                coupons: coupons.data,
                threshold: -1,
                percent: percent,
            }
        }

        if (rules.data.length > 0) {
            result.data.threshold = rules.data[0].threshold
        }

        if (tp == 'special') {
            result.data.basePrice = 13 // 减去的价格
        }

    }catch(e) {
        throw(e)
    }

    return result
}