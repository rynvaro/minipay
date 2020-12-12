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


   if (tp == "resetbalance") {
    let id = event.id
    return await db.collection('mstores').doc(id).update({
        data: {
            balance: 0
        }
    })
   }

   if (tp == "maxfanxian") {
    let id = event.id
    return await db.collection('mstores').doc(id).update({
        data: {
            maxFanxian: event.maxFanxian
        }
    })
   }

   if (tp == "canusebalance") {
    let id = event.id
    let canUseBalance = true 
    if (event.canUseBalance == 0) {
        canUseBalance = false
    }
    return await db.collection('mstores').doc(id).update({
        data: {
            canUseBalance: canUseBalance
        }
    })
   }

   if (tp == "fanxian100") {
    let id = event.id
    let fanxian100 = true 
    if (event.fanxian100 == 0) {
        fanxian100 = false
    }
    return await db.collection('mstores').doc(id).update({
        data: {
            fanxian100: fanxian100
        }
    })
   }

   if (tp == 'fanxian') {
       delete event._id
       return await db.collection('config').doc('fanxianconfig').update({
           data: event,
       })
   }

   if (tp == 'fanxianconfig') {
        return await db.collection('config').doc('fanxianconfig').get()
    }

   if (tp == 'updateuserbalance') {
       let id = event.id
       return await db.collection('users').doc(id).update({
           data: {
            'data.balance': event.balance
           }
       })
   }

   if (tp == 'coupondic') {
       return await db.collection('coupondic').get()
   }

   if (tp == 'coupondicadd') {
       let couponinstance = event
       delete couponinstance.tp
       couponinstance.value = parseInt(event.value*100)
       couponinstance.man = parseInt(event.man*100)
       couponinstance.vpday = parseInt(event.vpday)
       couponinstance.point = parseInt(event.value)
       couponinstance.type = 1
       couponinstance.status = 1
       return await db.collection('coupondic').add({
           data: couponinstance
       })
   }

   if (tp == 'coupondicdelete') {
        return await db.collection('coupondic').doc(event.id).remove()
    }

   if (tp == 'couponrules') {
       return await db.collection('couponrules').get()
   }
   

   if (tp == 'couponruleadd') {
        let ruleinstance = event
        delete ruleinstance.tp
        ruleinstance.threshold = parseInt(event.threshold*100)
        return await db.collection('couponrules').add({
            data: ruleinstance
        })
    }

    if (tp == 'couponruledelete') {
        return await db.collection('couponrules').doc(event.id).remove()
    }

   // 订单列表
   if (tp == 'orders') {
        let where = _.and({status: 1})
        if (event.storeId) {
            where = where.and({storeId: event.storeId})
        }

        if (event.startTime && event.endTime) {
            where = where.and({timestamp: _.gte(event.startTime).and(_.lte(event.endTime))})
        }

        if (event.q) {
            let q = event.q.trim()
            where = where.and({userName: db.RegExp({regexp: '.*' + q + '.*', options: 1})})
        }

        let count = await db.collection('iorders').where(where).count()

        let currentPage = event.currentPage
        let pageSize = event.pageSize
        let totalCount = count.total
        const orders = await db.collection('iorders').where(where).skip((currentPage-1)*pageSize).limit(pageSize).orderBy('timestamp','desc').get()

        return {
            data: orders.data,
            totalCount: totalCount,
            currentPage: currentPage,
            pageSize: pageSize,
        }
   }

   // 用户列表
   if (tp == 'userlist') {
    let q = event.q
    var where = {}
    if (q) {
        q = q.trim()
        where= {'data.name': db.RegExp({regexp: '.*' + q + '.*', options: 1})}
    }

    let count = await db.collection('users').where(where).count()

    let currentPage = event.currentPage
    let pageSize = event.pageSize
    let totalCount = count.total

    const users = await db.collection('users').where(where).skip((currentPage-1)*pageSize).limit(pageSize).orderBy('createdAt','desc').get()

    return {
        data: users.data,
        totalCount: totalCount,
        currentPage: currentPage,
        pageSize: pageSize,
    }
}

   if (tp == 'oacallback') {
       var oaUser = {
           _id: event.unionid,
           name: event.nickname,
           oaopenid: event.openid,
           timestamp: new Date().getTime()
       }
       return await db.collection('oausers').add({
           data: oaUser
       })
   }

    if (tp == 'wxe') {
        const tokens =  await db.collection('wxetokens').get()
        if (tokens.data.length > 0) {
            await db.collection('wxetokens').doc(tokens.data[0]._id).remove()
        }
        event.timestamp = Date.parse(new Date())
        return await db.collection('wxetokens').add({
            data: event
        })
    }

   if (tp == "events") {
       return await db.collection("events").orderBy('index','asc').get()
   }

   if (tp == "eventadd") {
       delete event.tp
       event.status = 1
       event.timestamp = new Date().getTime()
       
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

    // 财务板块汇总
    if (tp == 'financialsummary') {
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

        // 1 月收入和支出以及优惠券
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

        // 日收入以及优惠券
        const dayCashflows = await db.collection('iorders').aggregate().match({status: 1, timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).group({
            _id: null,
            in: $.sum('$totalAmount'),
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

        // 日支出
        const dayCashflowsOut = await db.collection('withdraws').aggregate().match({updatedAt: _.gte(dayStart).and(_.lt(dayEnd)), status: 3}).group({
            _id: dayStart,
            out: $.sum('$realWithdrawAmount')
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
        const monthOrders = await db.collection('iorders').where({status: 1, timestamp: _.gte(monthStart).and(_.lt(monthEnd))}).count()
        const dayOrders = await db.collection('iorders').where({status: 1, timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).count()

        // 用户统计
        const monthUsers = await db.collection('users').where({createdAt: _.gte(monthStart).and(_.lt(monthEnd))}).count()
        const dayUsers = await db.collection('users').where({createdAt: _.gte(dayStart).and(_.lt(dayEnd))}).count()

        // 月赏金令统计
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

        // 日赏金统计
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
    
        // m represents month and d represents day
        return {
            m: {
                in: cashflow.list[0].in,
                out: cashflow.list[0].out,
                orders: monthOrders.total,
                users: monthUsers.total,
                coupon: cashflow.list[0].coupon,
                subsidy: monthSubsidies.list[0].value,
            },
            d: {
                in: dayCashflows.list[0].in,
                out: dayCashflowsOut.list[0].out,
                orders: dayOrders.total,
                users: dayUsers.total,
                coupon: dayCashflows.list[0].realCoupon,
                subsidy: daySubsidies.list[0].value,
            }
        }
    }

    // 每日收支历史
    if (tp == 'financialinouthis') {
        let count = await db.collection('cashflows').count()

        let currentPage = event.currentPage
        let pageSize = event.pageSize
        let totalCount = count.total

        const results = await db.collection('cashflows').skip((currentPage-1)*pageSize).limit(pageSize).orderBy('_id','desc').get()

        return {
            data: results.data,
            totalCount: totalCount,
            currentPage: currentPage,
            pageSize: pageSize,
        }
    }

    // 优惠券使用记录
    if (tp == 'couponhis') {
        let count = await db.collection('iorders').where({status: 1, coupon: _.gt(0)}).count()

        let currentPage = event.currentPage
        let pageSize = event.pageSize
        let totalCount = count.total
        const monthOrders = await db.collection('iorders').where({status: 1, coupon: _.gt(0)}).skip((currentPage-1)*pageSize).limit(pageSize).orderBy('timestamp','desc').get()

        return {
            data: monthOrders.data,
            totalCount: totalCount,
            currentPage: currentPage,
            pageSize: pageSize,
        }
    }

    // 补贴记录
    if (tp == 'subsidyhis') {

        let count = await db.collection('subsidies').count()

        let currentPage = event.currentPage
        let pageSize = event.pageSize
        let totalCount = count.total
        const subsides = await db.collection('subsidies').skip((currentPage-1)*pageSize).limit(pageSize).orderBy('timestamp','desc').get()

        return {
            data: subsides.data,
            totalCount: totalCount,
            currentPage: currentPage,
            pageSize: pageSize,
        }
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

        // 1 月收入和支出
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
        const dayCashflows = await db.collection('iorders').aggregate().match({status: 1, timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).group({
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
        const monthOrders = await db.collection('iorders').where({status: 1, timestamp: _.gte(monthStart).and(_.lt(monthEnd))}).get()
        const dayOrders = await db.collection('iorders').where({status: 1, timestamp: _.gte(dayStart).and(_.lt(dayEnd))}).get()

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

    // 提现历史
    if (tp == 'withdrawhis') {
        let q = event.q
        var where = {status: _.eq(3)}
        if (q) {
            where= {merchantName: q ,status: _.eq(3)}
        }

        let count = await db.collection('withdraws').where(where).count()

        let currentPage = event.currentPage
        let pageSize = event.pageSize
        let totalCount = count.total

        var where = {status: _.eq(3)}
        if (q) {
            where= {merchantName: q ,status: _.eq(3)}
        }

        const withdrawHistories = await db.collection('withdraws').where(where).skip((currentPage-1)*pageSize).limit(pageSize).orderBy('publishedAt','desc').get()

        return {
            data: withdrawHistories.data,
            totalCount: totalCount,
            currentPage: currentPage,
            pageSize: pageSize,
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

    // 更新提现状态
    if (tp == 'withdrawupdate') {
        const result = await db.collection('withdraws').doc(event._id).update({
            data: {
                status: parseInt(event.status),
                realWithdrawAmount: parseFloat(event.realAmount),
                updatedAt: new Date().getTime()
            }
        })
        if (event.status == 3) {
            const currentWidthdraw = await db.collection('withdraws').doc(event._id).get()
            try {
                cloud.openapi.subscribeMessage.send({
                    touser: currentWidthdraw.data.openid,
                    templateId:'SLBtHQYki0LoIHTl0YPhKOKfaNAJk55Wuk_01kd2Ogw',
                    // miniprogramState: 'developer',
                    data: {
                        amount1:{
                            value:currentWidthdraw.data.withdrawAmount,
                        },
                        thing2: {
                            value: currentWidthdraw.data.bankCard,
                        },
                        amount3: {
                            value: currentWidthdraw.data.realWithdrawAmount,
                        },
                        date4:{
                            value: formatDate(new Date())
                        },
                    },
                })
            }catch(e) {
                console.log(e)
                return result
            }
        }
        
        return result
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

    if (tp == 'rake') {
        let id = event.id
        let norake = true 
        if (event.norake == 0) {
            norake = false
        }
        return await db.collection('mstores').doc(id).update({
            data: {
                norake: norake
            }
        })
    }

    if (tp == 'logout') {
        let id = event.id
        return await db.collection('mstores').doc(id).update({
            data: {
                openid: ''
            }
        })
    }

    if (tp == 'groupadd') {
        event.discount = parseFloat(event.discount)
        let discount = event.discount
        let stores = event.stores
        if (stores.length > 0) {
           let ids = []
           for (var i = 0; i<stores.length; i++) {
               ids.push(stores[i]._id)
           }
           await db.collection('mstores').where({_id: _.in(ids)}).update({
               data: {
                   discount: discount,
                   norake: true,
               }
           })
        }
        return await db.collection('groups').add({
            data: event
        })
    }

    if (tp == 'groupupdate') {
        let discount = parseFloat(event.discount)
        let id = event._id
        delete event.tp
        delete event._id
        let removes = event.removes
        delete event.removes

        for (var i = 0;i<removes.length; i++) {
            await db.collection('mstores').doc(removes[i]._id).update({
                data: {
                    discount: removes[i].discount,
                    norake: false,
                }
            })
        }

        let stores = event.stores
        if (stores.length > 0) {
           let ids = []
           for (var i = 0; i<stores.length; i++) {
               ids.push(stores[i]._id)
           }
           await db.collection('mstores').where({_id: _.in(ids)}).update({
               data: {
                   discount: discount,
                   norake: true,
               }
           })
        }
        event.discount = parseFloat(event.discount)
        return await db.collection('groups').doc(id).update({
            data: event
        })
    }

    if (tp == 'groupdelete') {
        const currentEvent = await db.collection('groups').doc(event._id).get()
        let stores = currentEvent.data.stores
        for (var i = 0; i< stores.length; i++) {
            await db.collection('mstores').doc(stores[i]._id).update({
                data: {
                    discount: stores[i].discount,
                    norake: false,
                }
            }) 
        }

       return await db.collection('groups').doc(event._id).remove()
    }

    if (tp == 'groupdisable') {
        const currentGroup = await db.collection('groups').doc(event.id).get()
        let stores = currentGroup.data.stores
        for (var i = 0; i<stores.length; i++) {
            await db.collection('mstores').doc(stores[i]._id).update({
                data: {
                    discount: stores[i].discount,
                    norake: false,
                }
            })
        }
        return await db.collection('groups').doc(event.id).update({
            data: {
                enabled: 0
            }
        })
    }

    if (tp == 'groupenable'){
        const currentGroup = await db.collection('groups').doc(event.id).get()
        let stores = currentGroup.data.stores
        for (var i = 0; i<stores.length; i++) {
            await db.collection('mstores').doc(stores[i]._id).update({
               data: {
                    discount: currentGroup.data.discount,
                    norake: true,
               }
            })
        }
        return await db.collection('groups').doc(event.id).update({
            data: {
                enabled: 1
            }
        })
    }

    if (tp == 'groups') {
        return await db.collection('groups').get()
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