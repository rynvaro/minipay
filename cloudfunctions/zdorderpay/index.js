// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log("event is ", event)

    let storeID = event.storeID
    let payAmount = parseFloat(event.payAmount)
    let couponID = event.couponID
    let mustPayAmount = parseFloat(event.mustPayAmount)

    var payby = parseInt(event.payby)

    var isWechat = payby

    let password = event.password

    var result = {}

    try {
        let history = event
        history.timestamp = Date.parse(new Date())
        history.type = 'dorderpay'
        delete history.password
        db.collection('histories').add({data: history})
        const store = await db.collection('mstores').doc(storeID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()
        // if (payby == 2 && sha1(password) != user.data.payPassword) {
        //     return -2 // 支付密码错误
        // }

        if (store.data.isPopup) {
            const tmpIorders = await db.collection('iorders').where({payType: 3, eventId: store.data.eventId, openid: wxContext.OPENID}).get()
            if (tmpIorders.data.length <= 0) {
                payby = 3
                event.basePrice = 13
            }
        }

        let level = user.data.data.level
        let delta = 0.0
        if ( level == 1 ) {
            delta = 0.5
        }else if (level == 2) {
            delta = 0.3
        }
        let realDiscount = store.data.discount + delta
        let rebate = (payAmount*(1-(realDiscount/10))).toFixed(2)
        let income7 = (payAmount * delta/10).toFixed(2)
        let realAmount = (payAmount - parseFloat(rebate)).toFixed(2)
        let totalAmount = (parseFloat(realAmount) + mustPayAmount).toFixed(2)
        if (totalAmount < 0) {
            totalAmount = 0
        } 
        
        let couponValue = 0
        if (couponID!=-1) {
            const coupon = await db.collection('icoupons').doc(couponID).get()
            couponValue = coupon.data.coupon.value/100
            totalAmount = (realAmount - couponValue + mustPayAmount).toFixed(2)
            if (totalAmount < 0) {
                totalAmount = 0
            } 
        }

        if (payby == 2) {
            if (user.data.data.balance < totalAmount*100) {
                return -1
            }
        }

        if (payby == 3) {
            let eventId = store.data.eventId
            const tmpIorders = await db.collection('iorders').where({payType: 3, eventId: eventId, openid: wxContext.OPENID}).get()
            if (tmpIorders.data.length > 0) {
                let tmpIOrder = tmpIorders.data[0]
                if (tmpIOrder.pay3Confirmed ) {
                    return -11
                }else {
                    await db.collection('iorders').doc(tmpIOrder._id).remove()
                }
            }
        }

        // const trans = await db.startTransaction()

        console.log(payby != 3,payby,"0000x0x0x0x00x0")
        if ( couponID != -1 && payby != 3){
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

        let finalAmount = parseFloat(realAmount) - couponValue
        let realCoupon = couponValue
        if (finalAmount < 0) {
            realCoupon = (couponValue + finalAmount).toFixed(2)
            finalAmount = 0
        }
        finalAmount = finalAmount + parseFloat(mustPayAmount)

        let isFirstPay = false
        if (user.data.data.payTimes ==  0) {
            isFirstPay = true
        }
        // let isNew = false 
        // if (new Date().getTime()/1000 - user.data.createdAt/1000 < 7200) {
        //     isNew = true
        // }

        let subsidy = 0
        if (isFirstPay && payby != 3) {
            subsidy = 5
            await db.collection('subsidies').add({
                data: {
                    timestamp: new Date().getTime(),
                    storeName: store.data.storeName,
                    storeId: store.data._id,
                    userName: user.data.data.name,
                    subsidy: subsidy,
                }
            })
        }

        var data = {
            storeId: storeID,
            couponId: couponID,
            openid: wxContext.OPENID,
            userName: user.data.data.name,
            storeName: store.data.storeName,
            productImage: store.data.storeImages[0],
            payAmount: parseFloat(payAmount),
            discount: parseFloat(store.data.discount),
            realDiscount: parseFloat(realDiscount),
            rebate: parseFloat(rebate),
            realAmount: parseFloat(realAmount),
            coupon: couponValue,
            totalAmount: parseFloat(realAmount),
            mustPayAmount: parseFloat(mustPayAmount),
            finalAmount: parseFloat(finalAmount.toFixed(2)),
            income7: parseFloat(income7),
            realCoupon: parseFloat(realCoupon),
            timestamp: Date.parse(new Date()),
            payType: payby, // 1 wechat 2 balance
            status: 1, // 已完成
            subsidy: subsidy, // 商家补贴
        }

        if (payby == 3) {
            if (isWechat == 1) {
                data.pay3Confirmed = true
            }
            let basePrice = event.basePrice
            data.finalAmount = payAmount - basePrice - couponValue
            if (data.finalAmount < 0) {
                data.finalAmount = 0
            }
            data.finalAmount = parseFloat(data.finalAmount.toFixed(2))
            finalAmount = data.finalAmount
            data.basePrice = basePrice
            data.eventId = store.data.eventId
        }

        result = await db.collection('iorders').add({
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

        let deltaPointAndExp = parseInt(finalAmount/10)
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

        
        let balance = user.data.data.balance
        if (payby == 2) {
            balance = user.data.data.balance - finalAmount*100
        }

        let exp = user.data.data.exp + parseInt(finalAmount/10)
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
        userPayAmount = userPayAmount + finalAmount

        let userData = {
            balance: balance,
            point: user.data.data.point + parseInt(finalAmount/10),
            exp: exp,
            expTotal: expTotal,
            level: newLevel,
            payTimes: user.data.data.payTimes + 1,
            payAmount: parseFloat(userPayAmount.toFixed(2)),
            isFirstPay: isFirstPay,
            
        }
        if (isFirstPay) {
            userData.firstPayStoreName = store.data.storeName
            userData.firstPayAmount = finalAmount
        }

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: userData
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
        if (user.data.data.inviteBy && isFirstPay) {
            const upLineUser = await db.collection('users').where({inviteCode: user.data.data.inviteBy}).get()
            if (upLineUser.data.length > 0) {
                upLineU = upLineUser.data[0]
                await db.collection('users').doc(upLineU._id).update({
                    data: {
                        data: {
                            exp: upLineU.data.balance + 1000
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
            }
        }
        
        orders = store.data.orders
        let avgPrice = store.data.avgPrice
        if (orders == 0) {
            avgPrice = parseFloat(finalAmount).toFixed(2) * 1
        }else {
            avgPrice = ((avgPrice * orders+parseFloat(finalAmount))/(orders + 1)).toFixed(2) * 1
        }

        // 商户收入
        await db.collection('mstores').doc(storeID).update({
            data: {
                balance: parseFloat((parseFloat(store.data.balance) + parseFloat(finalAmount) +parseFloat(realCoupon)+ parseFloat(subsidy)).toFixed(2)) - parseFloat(income7),
                orders: store.data.orders + 1,
                avgPrice: avgPrice,
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        // await trans.commit()

        return result

    }catch(e) {
        throw(e)
    }
}

function encodeUTF8(s) {
    var i, r = [], c, x;
    for (i = 0; i < s.length; i++)
      if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
      else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
      else {
        if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
          c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
            r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
        else r.push(0xE0 + (c >> 12 & 0xF));
        r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
      };
    return r;
}

// 字符串加密成 hex 字符串
function sha1(s) {
    var data = new Uint8Array(encodeUTF8(s))
    var i, j, t;
    var l = ((data.length + 8) >>> 6 << 4) + 16, s = new Uint8Array(l << 2);
    s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
    for (t = new DataView(s.buffer), i = 0; i < l; i++)s[i] = t.getUint32(i << 2);
    s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
    s[l - 1] = data.length << 3;
    var w = [], f = [
        function () { return m[1] & m[2] | ~m[1] & m[3]; },
        function () { return m[1] ^ m[2] ^ m[3]; },
        function () { return m[1] & m[2] | m[1] & m[3] | m[2] & m[3]; },
        function () { return m[1] ^ m[2] ^ m[3]; }
    ], rol = function (n, c) { return n << c | n >>> (32 - c); },
        k = [1518500249, 1859775393, -1894007588, -899497514],
        m = [1732584193, -271733879, null, null, -1009589776];
    m[2] = ~m[0], m[3] = ~m[1];
    for (i = 0; i < s.length; i += 16) {
        var o = m.slice(0);
        for (j = 0; j < 80; j++)
        w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
            t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
            m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
        for (j = 0; j < 5; j++)m[j] = m[j] + o[j] | 0;
    };
    t = new DataView(new Uint32Array(m).buffer);
    for (var i = 0; i < 5; i++)m[i] = t.getUint32(i << 2);

    var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
        return (e < 16 ? "0" : "") + e.toString(16);
    }).join("");

    return hex;
}