// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
// 获取店铺信息，计算打折等信息。
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let storeID = event.storeID
    let discount = 0
    let viplevel = 1
    let store = {}
    let v1discount = 0
    let v2discount = 0
    let v3discount = 0
    let banners = []
    try {
        const storeRecord = await db.collection('mstores').doc(storeID).get()
        store = storeRecord.data
        const user = await db.collection('users').doc(wxContext.OPENID).get()
        let exp = user.data.data.exp
        if (exp >=0 && exp <1000) {
            viplevel = 1
        }else if (exp >=1000 && exp <10000) {
            viplevel = 2
        } else if (exp >= 10000) {
            viplevel = 3
        }
        if (store.discount > 9) {
            discount = store.discount
            v1discount = store.discount
            v2discount = store.discount
            v3discount = store.discount
        } else {
            v1discount = store.discount + 0.5
            v2discount = store.discount + 0.3
            v3discount = store.discount
            if (exp >=0 && exp <1000) {
                discount = store.discount + 0.5
            }else if (exp >=1000 && exp <10000) {
                discount = store.discount + 0.3
            } else if (exp >= 10000) {
                discount = store.discount
            }
        }
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