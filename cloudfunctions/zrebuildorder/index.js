// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let merchantID = event.merchantID
    let storeID = event.storeID
    let payAmount = event.payAmount

    var result = {}

    try {
        const merchant = await db.collection('merchants').doc(merchantID).get()
        const store = await db.collection('stores').doc(storeID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        let exp = user.data.data.exp

        let delta = 0.0
        if ( exp < 1000 ) {
            delta = 0.5
        }else if (exp >= 1000 && exp <10000) {
            delta = 0.3
        }

        let realDiscount = merchant.data.discount.discountValue + delta
        let rebate = payAmount*(1-(realDiscount/10)).toFixed(2)
        let realAmount = (payAmount - rebate).toFixed(2)
        let totalAmount = realAmount

        console.log("store is: ",store)
        
        result = {
            data: {
                storeName: store.data.data.data.storeName,
                productImage: store.data.data.data.productImage,
                realDiscount: realDiscount,
                rebate: rebate,
                realAmount: realAmount,
                totalAmount: realAmount,
            }
        }

    }catch(e) {
        throw(e)
    }

    return result
}