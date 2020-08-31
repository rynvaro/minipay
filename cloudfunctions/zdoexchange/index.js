// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let cnt = event.cnt
    let couponId = event.couponID


    try {
        const user = await db.collection('users').doc(wxContext.OPENID).get()
        const coupons = await db.collection('coupons').get()


        coupon = coupons.data[0].coupons[couponId-1]

        console.log(coupon)

        if (coupon.point * cnt >user.point) {
            throw(e)
        }

        if (coupon.type == 1) {
            await db.collection('users').doc(wxContext.OPENID).update({
                data: {
                    data: {
                        point: user.data.data.point - coupon.point * cnt,
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

            for (var i = 0;i<cnt;i++) {
                await db.collection('icoupons').add({
                    data: {
                        openid: wxContext.OPENID,
                        coupon: coupon,
                        status: 0,// 0 未使用 1 已使用
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

            // 积分变更记录
            await db.collection('pointrecords').add({
                data: {
                    openid: wxContext.OPENID,
                    type: 2, // 兑换优惠券
                    action: '-',
                    value: coupon.point * cnt,
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

        }else if (coupon.type==2) {
            await db.collection('users').doc(wxContext.OPENID).update({
                data: {
                    data: {
                        point: user.data.data.point - coupon.point * cnt,
                        exp: user.data.data.exp + coupon.point * cnt
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

            // 积分变更记录
            await db.collection('pointrecords').add({
                data: {
                    openid: wxContext.OPENID,
                    type: 3, // 兑换经验
                    action: '-',
                    value: coupon.point * cnt,
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

             // 积分变更记录
             await db.collection('exprecords').add({
                data: {
                    openid: wxContext.OPENID,
                    type: 2, // 积分兑换
                    action: '+',
                    value: coupon.point * cnt,
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

        
    }catch(e) {
        console.log(e)
        throw(e)
    }

    return {}
}