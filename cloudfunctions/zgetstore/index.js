// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
// 获取店铺信息，计算打折等信息。
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let storeID = event.storeID
    let merchantID = event.merchantID
    let discount = 0
    let viplevel = 1
    let store = {}
    let v1discount = 0
    let v2discount = 0
    let v3discount = 0
    let banners = []
    try {
        const merchant = await db.collection('merchants').doc(merchantID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()
        let exp = user.data.data.exp
        if (exp >=0 && exp <1000) {
            viplevel = 1
        }else if (exp >=1000 && exp <10000) {
            viplevel = 2
        } else if (exp >= 10000) {
            viplevel = 3
        }
        if (merchant.data.discount.discountValue > 9) {
            discount = merchant.data.discount.discountValue
            v1discount = merchant.data.discount.discountValue
            v2discount = merchant.data.discount.discountValue
            v3discount = merchant.data.discount.discountValue
        } else {
            v1discount = merchant.data.discount.discountValue + 0.5
            v2discount = merchant.data.discount.discountValue + 0.3
            v3discount = merchant.data.discount.discountValue 
            if (exp >=0 && exp <1000) {
                discount = merchant.data.discount.discountValue + 0.5
            }else if (exp >=1000 && exp <10000) {
                discount = merchant.data.discount.discountValue + 0.3
            } else if (exp >= 10000) {
                discount = merchant.data.discount.discountValue
            }
        }
        const storeRecord = await db.collection('stores').doc(storeID).get()
        store = storeRecord.data.data.data
        banners = storeRecord.data.banners
    }catch(e) {
        throw(e)
    }

    return {
        v1discount:v1discount,
        v2discount:v2discount,
        v3discount:v3discount,
        discount: discount,
        viplevel: viplevel,
        store: store,
        banners: banners,
    }
}