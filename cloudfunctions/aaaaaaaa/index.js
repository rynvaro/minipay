// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log(wxContext)

    const _ = db.command

    wxContext.OPENID = 'oUyaw4jq_vfcGE91SiR5hPokx0oo'

    event.storeID = 'd81cd5415f645694000c6d0d7a01d6d3'
    event.orderId = '59699023431976766380809897974916'
    event.payby = 1

    console.log("event is ", event)

    let storeID = event.storeID
    let orderId = event.orderId
    var payby = parseInt(event.payby)
    
    let openid = wxContext.OPENID
    if (event.openid) {
        openid = event.openid
    }

    var result = {}

    try {
        let history = event
        history.timestamp = Date.parse(new Date())
        history.type = 'dorderpay'
        db.collection('histories').add({data: history})

        const store = await db.collection('mstores').doc(storeID).get()
        console.log("|**********************|")
        console.log("|",store.data.balance,"|")
        console.log("|*****************|")
        const user = await db.collection('users').doc(openid).get()
        const iorder = await db.collection('iorders').doc(orderId).get()

        
        
        if (payby == 2) {
            if (user.data.data.balance < (iorder.data.finalAmount*100)) {
                await db.collection('iorders').doc(orderId).remove()
                return -1
            }
        }

        // const trans = await db.startTransaction()

        let couponID = iorder.data.couponId
        if ( couponID != -1 && payby != 3){
            const icouponUpdate = await db.collection('icoupons').doc(couponID).update({
                data: {
                    status: 1,
                }
            })
            console.log('icouponUpdate: ',icouponUpdate)
        }

        let isFirstPay = false
        if (user.data.data.payTimes ==  0) {
            isFirstPay = true
        }

        let subsidy = 0
       
        result = await db.collection('iorders').doc(orderId).update({
            data: {
                status: 1,
                subsidy: subsidy,
                payType: payby,
            }
        })
        result._id = orderId

        let deltaPointAndExp = parseInt(iorder.data.totalAmount/10)
        if (deltaPointAndExp > 0) {
            // 积分变更记录
            const pointrecordAdd = await db.collection('pointrecords').add({
                data: {
                    openid: openid,
                    type: 4, // 消费
                    action: '+',
                    value: deltaPointAndExp,
                    timestamp: Date.parse(new Date()),
                }
            })
            console.log('pointrecordAdd: ',pointrecordAdd)

            // 经验变更记录
            const exprecordAdd =  await db.collection('exprecords').add({
                data: {
                    openid: openid,
                    type: 1, // 消费
                    action: '+',
                    value: deltaPointAndExp,
                    timestamp: Date.parse(new Date()),
                }
            })
            console.log('pointrecordAdd: ', exprecordAdd)
        }

        
        let balance = user.data.data.balance
        if (payby == 2) {
            balance = user.data.data.balance - iorder.data.finalAmount*100
        }

        let exp = user.data.data.exp + parseInt(iorder.data.finalAmount/10)
        let newLevel = 1
        let expTotal = 1001
        if (exp > 1000) {
            newLevel = 2
            expTotal = 10001
        }
        if (exp > 10000) {
            newLevel = 3
            expTotal = 10001
        }

        let userPayAmount = 0
        if (user.data.data.payAmount) {
            userPayAmount = user.data.data.payAmount
        }

        let userData = {
            balance: balance,
            point: _.inc(parseInt(iorder.data.totalAmount/10)),
            exp: exp,
            expTotal: expTotal,
            level: newLevel,
            payTimes: _.inc(1),
            payAmount: _.inc(iorder.data.totalAmount),
            isFirstPay: isFirstPay,
            
        }
        if (isFirstPay) {
            userData.firstPayStoreName = store.data.storeName
            userData.firstPayAmount = iorder.data.totalAmount
        }

        const userUpdate = await db.collection('users').doc(openid).update({
            data: {
                data: userData
            }
        })
        console.log('userUpdate: ',userUpdate)

        orders = store.data.orders
        let avgPrice = store.data.avgPrice
        if (orders == 0) {
            avgPrice = parseFloat(iorder.data.totalAmount).toFixed(2) * 1
        }else {
            avgPrice = ((avgPrice * orders+parseFloat(iorder.data.totalAmount))/(orders + 1)).toFixed(2) * 1
        }

        // 商户收入
        
    
        let updatedBalance = parseFloat(( parseFloat(iorder.data.totalAmount) + parseFloat(subsidy)- parseFloat(iorder.data.income7)).toFixed(2))
        let ordersCnt = store.data.orders + 1
        var std = {
          balance: _.inc(updatedBalance),
          orders: ordersCnt,
          avgPrice: avgPrice,
        }
        const storeUpdate = await db.collection('mstores').doc(storeID).update({
            data: std
        })
        console.log("storeUpdate:", storeUpdate)
        // await trans.commit()

        return result

    }catch(e) {
        throw(e)
    }
}
