// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log("event is ", event)

    let merchantID = event.merchantID
    let storeID = event.storeID
    let payAmount = event.payAmount
    let couponID = event.couponID

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

        let couponValue = 0

        console.log(couponID!=-1)
        console.log("0-----")
        if (couponID!=-1) {
            const coupon = await db.collection('icoupons').doc(couponID).get()
            couponValue = coupon.data.coupon.value/100
            totalAmount = realAmount - couponValue
            await db.collection('icoupons').doc(couponID).update({
                data: {
                    status: 1,
                },
                success: res => {
                    console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
                },
                fail: err => {
                    console.error('[数据库] [新增记录] 失败：', err)
                    throw(e)
                }
            })
        }

        await db.collection('iorders').add({
            data: {
                couponId: couponID,
                openid: wxContext.openid,
                storeName: store.data.data.data.storeName,
                productImage: store.data.data.data.productImage,
                realDiscount: realDiscount,
                rebate: rebate,
                realAmount: realAmount,
                coupon: couponValue,
                totalAmount: realAmount,
                timestamp: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        await db.collection('orders').add({
            data: {
                couponId: couponID,
                openid: wxContext.openid,
                storeId: storeID,
                storeName: store.data.data.data.storeName,
                productImage: store.data.data.data.productImage,
                realDiscount: realDiscount,
                rebate: rebate,
                realAmount: realAmount,
                coupon: couponValue,
                totalAmount: realAmount,
                timestamp: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    balance: user.data.data.balance - totalAmount*100,
                    point: user.data.data.point + parseInt(totalAmount/10),
                    exp: user.data.data.exp + parseInt(totalAmount/10),
                }
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })
        


    }catch(e) {
        throw(e)
    }

    return result
}