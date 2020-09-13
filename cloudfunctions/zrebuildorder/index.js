// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let storeID = event.storeID

    var result = {}

    try {
        const store = await db.collection('mstores').doc(storeID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        let exp = user.data.data.exp

        let delta = 0.0
        if (store.data.discount <=9) {
            if ( exp < 1000 ) {
                delta = 0.5
            }else if (exp >= 1000 && exp <10000) {
                delta = 0.3
            }
        }

        let realDiscount = store.data.discount + delta
        
        result = {
            data: {
                storeName: store.data.storeName,
                productImage: store.data.productImages[0],
                storeImage: store.data.storeImages[0],
                realDiscount: realDiscount,
            }
        }

    }catch(e) {
        throw(e)
    }

    return result
}