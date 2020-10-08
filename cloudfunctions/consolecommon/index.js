// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const _ = db.command
    const $ = _.aggregate

   let tp = event.tp
   console.log(event)

   if (tp == "events") {
       return await db.collection("events").orderBy('index','asc').get()
   }

   if (tp == "eventadd") {
       delete event.tp
       event.status = 1
       
       const currentEvent = await db.collection('events').add({
            data: event
        })

        if (event.type == '1') {
            let stores = event.stores
            if (stores.length > 0) {
                // 更新快闪店
                let ids = []
                for (var i = 0; i<stores.length; i++) {
                    ids.push(stores[i]._id)
                }
     
                await db.collection('mstores').where({_id: _.in(ids)}).update({
                    data: {
                        isPopup: true,
                        eventId: currentEvent._id
                    }
                })
            }
        }

       return currentEvent
   }

   if (tp == "eventdelete") {
       await db.collection('lottories').where({eventId: event._id}).remove()
       const currentEvent = await db.collection('events').doc(event._id).get()
       if (event.type == '1') {
        let stores = currentEvent.data.stores
        var ids = []
        for (var i = 0; i<stores.length; i++) {
         ids.push(stores[i]._id)
        }  
        await db.collection('mstores').where({_id: _.in(ids)}).update({
             data: {
                 isPopup: false,
                 eventId: ''
             }
         }) 
       }
       
       return await db.collection('events').doc(event._id).remove()
   }

   if (tp == "eventupdate") {
       let id = event._id
        delete event.tp
        delete event._id
        let dids = event.dids
        delete event.dids
        if (dids.length > 0) {
            await db.collection('mstores').where({_id: _.in(dids)}).update({
                data: {
                    isPopup: false,
                    eventId: ''
                }
            })
        }
        let stores = event.stores
       if (stores.length > 0) {
           // 更新快闪店
           let ids = []
           for (var i = 0; i<stores.length; i++) {
               ids.push(stores[i]._id)
           }
           await db.collection('mstores').where({_id: _.in(ids)}).update({
               data: {
                   isPopup: true,
                   eventId: id
               }
           })
       }
        return await db.collection('events').doc(id).update({
            data: event
        })
    }

    if (tp == "storedelete") {
        return await db.collection('mstores').doc(event._id).update({
            data: {
                deleted: event.deleted,
            }
        })
    }

    if (tp == "storedeletehard") {
        const toDelete = await db.collection('mstores').doc(event._id).get()
        return await db.collection('mstores').doc(toDelete.data._id).remove()
    }

    if (tp == "exchangebanners") {
        return await db.collection('plates').where({type: 'banner'}).get()
    }

    if (tp == "exchangebannerdelete") {
        return await db.collection('plates').doc(event.id).delete()
    }

    if (tp == "exchangebanneradd") {
        delete event.tp
        event.type = 'banner'
        return await db.collection('plates').add({
            data: event,
        })
    }

    if (tp == "switchplatestatus") {
        return await db.collection('plates').doc(event._id).update({
            data: {
                status: event.status
            }
        })
    }

    if (tp == 'financial') {


        let dayDate = new Date()
        dayDate.setHours(16, 0, 0, 0)
        dayDate.setDate(dayDate.getDate()-1)
        let dayStart = dayDate.getTime()

        
        let date = new Date()
        date.setHours(16, 0, 0, 0)
        date.setDate(0)
        let monthStart = date.getTime()

        let nowDate = new Date()
        nowDate.setHours(nowDate.getHours() + 8)
        let monthEnd = nowDate.getTime()
        let dayEnd = nowDate.getTime()

        // 1 获取流水信息
        const cashflow  = await db.collection('cashflows').aggregate().match({_id: _.gte(monthStart).and(_.lt(monthEnd))}).group({
            _id: monthStart,
            in: $.sum('$in'),
            out: $.sum('$out'),
            coupon: $.sum('$coupon'),
        }).end()
        if (cashflow.list.length <=0) {
            cashflow.list = [
                {
                    in: 0,
                    out: 0,
                    coupon: 0,
                }
        ]
        }

        const cashflows = await db.collection('cashflows').where({_id: _.gte(monthStart).and(_.lt(monthEnd))}).get()

        console.log('day start is: ',dayStart)
        const dayCashflows = await db.collection('iorders').aggregate().match({timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).group({
            _id: null,
            in: $.sum('$finalAmount'),
            coupon: $.sum('$coupon'),
            realCoupon: $.sum('$realCoupon')
        }).end()
        if (dayCashflows.list.length <=0) {
            dayCashflows.list = 
            [
                {
                    in: 0,
                    coupon:0,
                    realCoupon:0
                }
            ]
        }

        console.log('day cash flows is', dayCashflows)
        const dayCashflowsOut = await db.collection('withdraws').aggregate().match({updatedAt: _.gte(dayStart).and(_.lt(dayEnd)), status: 3}).group({
            _id: dayStart,
            out: $.sum('$withdrawAmount')
        }).end()

        if (dayCashflowsOut.list.length <=0) {
            dayCashflowsOut.list = 
            [
                {
                    out: 0,
                }
            ]
        }
        

        // 订单统计
        // TODO change to orders
        const monthOrders = await db.collection('iorders').where({timestamp: _.gte(monthStart).and(_.lt(monthEnd))}).get()
        const dayOrders = await db.collection('iorders').where({timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).get()

        let couponHistories = []
        for (var i = 0; i< monthOrders.data.length; i++) {
            if (monthOrders.data[i].coupon > 0) {
                couponHistories.push(monthOrders.data[i])
            }
        }

        // 补贴统计
        const monthSubsidies = await db.collection('subsidies').aggregate().match({timestamp: _.gte(monthStart).and(_.lt(monthEnd))}).group({
            _id: monthStart,
            value: $.sum('$subsidy')
        }).end()
        if (monthSubsidies.list.length == 0) {
            monthSubsidies.list = [
                {
                    _id: monthStart,
                    value: 0,
                }
            ]
        }

        const daySubsidies = await db.collection('subsidies').aggregate().match({timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).group({
            _id: dayStart,
            value: $.sum('$subsidy')
        }).end()
        if (daySubsidies.list.length == 0) {
            daySubsidies.list = [
                {
                    _id: dayStart,
                    value: 0,
                }
            ]
        }

        const subsides = await db.collection('subsidies').where({timestamp: _.gte(monthStart).and(_.lt(monthEnd))}).get()

        // 用户统计
        const monthUsers = await db.collection('users').where({createdAt: _.gte(monthStart).and(_.lt(monthEnd))}).orderBy('createdAt','desc').get()
        const dayUsers = await db.collection('users').where({createdAt: _.gte(dayStart).and(_.lt(dayEnd))}).orderBy('createdAt','desc').get()

        return {
            cashflow: {
                month: [
                    {
                        in: cashflow.list[0].in,
                        out: cashflow.list[0].out,
                    }
                ],
                day: [
                    {
                        in: dayCashflows.list[0].in,
                        out: dayCashflowsOut.list[0].out,
                    }
                ],
                histories: cashflows.data
            },
            
            order: {
                statistics: [
                    {
                        month: monthOrders.data.length,
                        day: dayOrders.data.length
                    }
                ],
                histories: monthOrders.data
            },
            coupon: {
                statistics:
                [
                    {
                        month: cashflow.list[0].coupon,
                        day: dayCashflows.list[0].coupon,
                    }
                ],
                histories: couponHistories
            },
        subsidy: {
            statistics: [
                {
                    month: monthSubsidies.list[0].value,
                    day: daySubsidies.list[0].value,
                }
            ],
            histories: subsides.data
        },
        user: {
            statistics: [
                {
                    month: monthUsers.data.length,
                    day: dayUsers.data.length,
                }
            ],
            histories: monthUsers.data
        }
        }
    }

    if (tp == 'withdraws') {
        const withdrawRequests = await db.collection('withdraws').where({status: _.in([0,1,2])}).get()
        const withdrawHistories = await db.collection('withdraws').where({status: _.eq(3)}).get()
        let dayDate = new Date()
        dayDate.setHours(16, 0, 0, 0)
        dayDate.setDate(dayDate.getDate()-1)
        let dayStart = dayDate.getTime()

        
        let date = new Date()
        date.setHours(16, 0, 0, 0)
        date.setDate(0)
        let monthStart = date.getTime()

        let nowDate = new Date()
        nowDate.setHours(nowDate.getHours() + 8)
        let monthEnd = nowDate.getTime()
        let dayEnd = nowDate.getTime()

        const monthWithdraws = await db.collection('withdraws').aggregate().match({updatedAt: _.gte(monthStart).and(_.lt(monthEnd)), status: 3}).group({
            _id: monthStart,
            out: $.sum('$withdrawAmount')
        }).end()

        if (monthWithdraws.list.length <=0) {
            monthWithdraws.list = 
            [
                {
                    out: 0,
                }
            ]
        }

        const dayWithdraws = await db.collection('withdraws').aggregate().match({updatedAt: _.gte(dayStart).and(_.lt(dayEnd)), status: 3}).group({
            _id: dayStart,
            out: $.sum('$withdrawAmount')
        }).end()

        if (dayWithdraws.list.length <=0) {
            dayWithdraws.list = 
            [
                {
                    out: 0,
                }
            ]
        }

        return {
            month: monthWithdraws.list[0].out,
            day: dayWithdraws.list[0].out,
            reqs: withdrawRequests.data,
            histories: withdrawHistories.data
        }
    }

    if (tp == 'withdrawupdate') {
        return await db.collection('withdraws').doc(event._id).update({
            data: {
                status: parseInt(event.status),
                realWithdrawAmount: parseFloat(event.realAmount),
                updatedAt: new Date().getTime()
            }
        })
    }

    if (tp == 'homeheader') {
        delete event.tp
        event.time = new Date().getTime()
        return await db.collection('homeheader').add({
            data: event
        })
    }

    if (tp == 'checklottory') {
        let phone = event.phone
        const joinedusers = await db.collection('lottories').where({phone: phone}).get()
        if (joinedusers.data.length == 0) {
            return -1 // 用户不存在
        }
        if (joinedusers.data[0].status == 2) {
            return 1
        }
        await db.collection('lottories').doc(joinedusers.data[0]._id).update({
            data: {
                status: 2,
            }
        })
        const eventData = await db.collection('events').doc(joinedusers.data[0].eventId).get()
        if (joinedusers.data[0].res.QkzsvPewwG2DNQORKHqmlvZxhkhYD9CHKF46lL1w_1M == 'accept') {
            cloud.openapi.subscribeMessage.send({
                touser: joinedusers.data[0].openid,
                templateId:'QkzsvPewwG2DNQORKHqmlvZxhkhYD9CHKF46lL1w_1M',
                page: 'pages/lottory/lottory?event='+JSON.stringify(eventData.data),
                // miniprogramState: 'developer',
                data: {
                    phrase1:{
                        value:'审核通过',
                    },
                    thing2: {
                        value: '锦鲤抽奖',
                    },
                    date3: {
                        value: formatDate(new Date())
                    },
                    thing4:{
                        value: '审核通过'
                    },
                },
            })
            return 1
        }else {
            return 'reject'
        }
    }

   return {}
}

function formatDate(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join('.')
  }
  
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}