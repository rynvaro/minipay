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
    let payAmount = parseFloat(event.payAmount)
    let couponID = event.couponID
    let mustPayAmount = parseFloat(event.mustPayAmount)

    let payby = event.payby

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
        let rebate = (payAmount*(1-(realDiscount/10))).toFixed(2)
        let realAmount = (payAmount - parseFloat(rebate)).toFixed(2)
        let totalAmount = (parseFloat(realAmount) + mustPayAmount).toFixed(2)
        
        let couponValue = 0
        if (couponID!=-1) {
            const coupon = await db.collection('icoupons').doc(couponID).get()
            couponValue = coupon.data.coupon.value/100
            totalAmount = (realAmount - couponValue + mustPayAmount).toFixed(2)
        }

        if (payby == 2) {
            if (user.data.data.balance < totalAmount*100) {
                return -1
            }
        }

        if ( couponID != -1 ){
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

        var data = {
            storeId: storeID,
            couponId: couponID,
            openid: wxContext.OPENID,
            storeName: store.data.data.data.storeName,
            productImage: store.data.data.data.productImage,
            payAmount: payAmount,
            realDiscount: realDiscount,
            rebate: rebate,
            realAmount: realAmount,
            coupon: couponValue,
            totalAmount: realAmount,
            mustPayAmount: mustPayAmount,
            timestamp: Date.parse(new Date()),
            payType: payby, // 1 wechat 2 balance
            status: 1, // 已完成
        }

        await db.collection('iorders').add({
            data: data,
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        await db.collection('orders').add({
            data: data,
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        let deltaPointAndExp = parseInt(totalAmount/10)
        if (deltaPointAndExp > 0) {
            // 积分变更记录
            await db.collection('pointrecords').add({
                data: {
                    openid: wxContext.OPENID,
                    type: 4, // 消费
                    action: '+',
                    value: deltaPointAndExp,
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

            // 经验变更记录
            await db.collection('exprecords').add({
                data: {
                    openid: wxContext.OPENID,
                    type: 1, // 消费
                    action: '+',
                    value: deltaPointAndExp,
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
        }

        let isFirstPay = false
        if (user.data.data.payTimes ==  0) {
            isFirstPay = true
        }
        let balance = user.data.data.balance
        if (payby == 2) {
            balance = user.data.data.balance - totalAmount*100
        }

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    balance: balance,
                    point: user.data.data.point + parseInt(totalAmount/10),
                    exp: user.data.data.exp + parseInt(totalAmount/10),
                    payTimes: user.data.data.payTimes + 1,
                    isFirstPay: isFirstPay,
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

        // 邀请者收益
        if (user.data.data.inviteBy) {
            const upLineUser = await db.collection('users').where({inviteCode: user.data.data.inviteBy}).get()
            if (upLineUser.data.length > 0) {
                upLineU = upLineUser.data[0]
                await db.collection('users').doc(upLineU._id).update({
                    data: {
                        data: {
                            exp: upLineU.data.exp + 10
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

                await db.collection('exprecords').add({
                    data: {
                        openid: upLineU._id,
                        type: 1, // 消费
                        action: '+',
                        value: 10,
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
            }
        }
        

        // 商户收入
        await db.collection('merchants').doc(merchantID).update({
            data: {
                balance: (parseFloat(merchant.data.balance) + parseFloat(totalAmount)),
                dayBi: (parseFloat(merchant.data.dayBi) + parseFloat(totalAmount)),
                sales: merchant.data + 1,
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