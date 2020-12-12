// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const _ = db.command
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
        const user = await db.collection('users').doc(openid).get()
        const fanxianConfig = await db.collection('config').doc('fanxianconfig').get()


        const lock = await db.collection('iorders').doc(orderId).update({
            data: {
                progress: _.inc(1)
            }
        })
        console.log("lock is: ", lock)
        const iorder = await db.collection('iorders').doc(orderId).get()
        console.log("progress: is", iorder.data.progress)
        if (iorder.data.progress > 1) {
            return iorder.data
        }

        if (iorder.data.status == 1) {
            return iorder.data
        }

        // if (store.data.isPopup) {
        //     const tmpIorders = await db.collection('iorders').where({payType: 3, eventId: store.data.eventId, openid: openid}).get()
        //     if (tmpIorders.data.length <= 0) {
        //         payby = 3
        //         event.basePrice = 13
        //     }
        // }
        
        
        if (payby == 2) {
            if (user.data.data.balance < (iorder.data.finalAmount*100)) {
                await db.collection('iorders').doc(orderId).remove()
                return -1
            }
        }

        // if (payby == 3) {
        //     let eventId = store.data.eventId
        //     const tmpIorders = await db.collection('iorders').where({payType: 3, eventId: eventId, openid: openid}).get()
        //     if (tmpIorders.data.length > 0) {
        //         let tmpIOrder = tmpIorders.data[0]
        //         if (tmpIOrder.pay3Confirmed ) {
        //             return -11
        //         }else {
        //             await db.collection('iorders').doc(tmpIOrder._id).remove()
        //         }
        //     }
        // }

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

        let fanxian = iorder.data.fanxian

        let maxFanxian = store.data.maxFanxian

        if (!maxFanxian) {
            let configMaxFanxian = fanxianConfig.data.maxFanxian
            maxFanxian = configMaxFanxian
        }

        if (fanxian > maxFanxian) {
            fanxian = maxFanxian
        }

        let percent = iorder.data.percent
        let isFirstPay = false
        if (user.data.data.payTimes ==  0) {
            isFirstPay = true
            fanxian = parseFloat((fanxianConfig.data.firstFanxianPercent/100 * (iorder.data.payAmount - iorder.data.realCoupon)).toFixed(2))
            if (fanxian > maxFanxian) {
                fanxian = maxFanxian
            }
            percent = fanxianConfig.data.firstFanxianPercent
        }

        let isSecondPay = false
        if (user.data.data.payTimes ==  1) {
            isSecondPay = true
            fanxian = parseFloat((fanxianConfig.data.secondFanxianPercent/100 * (iorder.data.payAmount - iorder.data.realCoupon)).toFixed(2))
            if (fanxian > maxFanxian) {
                fanxian = maxFanxian
            }
            percent = fanxianConfig.data.secondFanxianPercent
        }

        let isThirdPay = false
        if (user.data.data.payTimes ==  2) {
            isThirdPay = true
            fanxian = parseFloat((fanxianConfig.data.thirdFanxianPercent/100 * (iorder.data.payAmount - iorder.data.realCoupon)).toFixed(2))
            if (fanxian > maxFanxian) {
                fanxian = maxFanxian
            }
            percent = fanxianConfig.data.thirdFanxianPercent
        }

        // 参与返现100活动
        if (store.data.fanxian100) {
            const fanxian100Records = await db.collection('fanxian100').where({idd: openid + '_' + store.data._id}).get()
            if (fanxian100Records.data.length == 0) {
                percent = 100
                fanxian = iorder.data.payAmount - iorder.data.realCoupon 
                if (fanxian > maxFanxian) {
                    fanxian = maxFanxian
                }
                await db.collection('fanxian100').add({
                    data: {
                        idd: openid + '_' + store.data._id,
                        openid: openid,
                        userName: user.data.data.name,
                        storeId: store.data._id,
                        storeName: store.data.storeName,
                    }
                })
            }
        }

        let subsidy = 0
        // if (isFirstPay && payby != 3) {
        //     subsidy = 5
        //     const subsidyAdd = await db.collection('subsidies').add({
        //         data: {
        //             timestamp: new Date().getTime(),
        //             storeName: store.data.storeName,
        //             storeId: store.data._id,
        //             userName: user.data.data.name,
        //             subsidy: subsidy,
        //         }
        //     })
        //     console.log('subsidyAdd: ',subsidyAdd)
        // }

        // var data = {
        //     storeId: storeID,
        //     couponId: couponID,
        //     openid: openid,
        //     userName: user.data.data.name,
        //     storeName: store.data.storeName,
        //     productImage: store.data.storeImages[0],
        //     payAmount: parseFloat(payAmount),
        //     discount: parseFloat(store.data.discount),
        //     realDiscount: parseFloat(realDiscount),
        //     rebate: parseFloat(rebate),
        //     realAmount: parseFloat(realAmount),
        //     coupon: couponValue,
        //     totalAmount: parseFloat(realAmount),
        //     mustPayAmount: parseFloat(mustPayAmount),
        //     finalAmount: parseFloat(finalAmount.toFixed(2)),
        //     income7: parseFloat(income7),
        //     realCoupon: parseFloat(realCoupon),
        //     timestamp: Date.parse(new Date()),
        //     payType: payby, // 1 wechat 2 balance
        //     status: 1, // 已完成
        //     subsidy: subsidy, // 商家补贴
        // }

        // if (payby == 3) {
        //     if (isWechat == 1) {
        //         data.pay3Confirmed = true
        //     }
        //     let basePrice = event.basePrice
        //     data.finalAmount = payAmount - basePrice - couponValue
        //     if (data.finalAmount < 0) {
        //         data.finalAmount = 0
        //     }
        //     data.finalAmount = parseFloat(data.finalAmount.toFixed(2))
        //     finalAmount = data.finalAmount
        //     data.basePrice = basePrice
        //     data.eventId = store.data.eventId
        // }

        result = await db.collection('iorders').doc(orderId).update({
            data: {
                status: 1,
                subsidy: subsidy,
                fanxian: fanxian,
                isFirstPay: isFirstPay,
                isSecondPay: isSecondPay,
                isThirdPay: isThirdPay,
                percent: percent,
                // payType: payby,
            }
        })
        result._id = orderId

        let deltaPointAndExp = parseInt((iorder.data.payAmount + iorder.data.mustPayAmount)/10)
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
            balance = user.data.data.balance - iorder.data.payAmount*100 - iorder.data.mustPayAmount *100 + iorder.data.realCoupon * 100
            await db.collection('deposits').add({
                data: {
                    opendi: openid,
                    depositAmount: (iorder.data.payAmount + iorder.data.mustPayAmount)*100,
                    status: 1,
                    type: 1,// 消费
                    remarks: '余额消费',
                    timestamp: Date.parse(new Date()),
                }
            })
        }

        balance = parseFloat((balance + fanxian*100).toFixed(2))
        await db.collection('deposits').add({
            data: {
                opendi: openid,
                depositAmount: fanxian * 100,
                status: 1,
                type: 2,// 返现
                remarks: '正常返现',
                timestamp: Date.parse(new Date()),
            }
        })
        if (iorder.data.payType == 4) {
            balance = parseFloat((balance - iorder.data.balancePayment * 100 + iorder.data.realCoupon * 100).toFixed(2))
            await db.collection('deposits').add({
                data: {
                    opendi: openid,
                    depositAmount: iorder.data.balancePayment * 100,
                    status: 1,
                    type: 1,// 消费
                    timestamp: Date.parse(new Date()),
                }
            })
        }

        let firstFanxianComplete = user.data.data.firstFanxianComplete

        let exp = user.data.data.exp + deltaPointAndExp
        let newLevel = 1
        let expTotal = 1001
        if (exp > 1000) {
            newLevel = 2
            expTotal = 10001
                if (!firstFanxianComplete) {
                    let firstPayAmount = user.data.data.firstPayAmount
                    if (!firstPayAmount) {
                        firstPayAmount = iorder.data.payAmount
                    }
                    fanxian = parseFloat(((100-fanxianConfig.data.firstFanxianPercent)/100 * (firstPayAmount)).toFixed(2))
                    if (fanxian > maxFanxian) {
                        fanxian = maxFanxian
                    }
                    balance = parseFloat((balance + fanxian*100).toFixed(2))
                    await db.collection('deposits').add({
                        data: {
                            opendi: openid,
                            depositAmount: fanxian * 100,
                            status: 1,
                            type: 2,// 返现
                            remarks: 'v2返现',
                            timestamp: Date.parse(new Date()),
                        }
                    })
                    firstFanxianComplete = true
                }
        }
        if (exp > 10000) {
            newLevel = 3
            expTotal = 10001
        }

        let userPayAmount = 0
        if (user.data.data.payAmount) {
            userPayAmount = user.data.data.payAmount
        }
        userPayAmount = userPayAmount + iorder.data.totalAmount

        let userData = {
            balance: parseFloat(balance.toFixed(2)),
            point: user.data.data.point + deltaPointAndExp,
            exp: exp,
            expTotal: expTotal,
            level: newLevel,
            payTimes: user.data.data.payTimes + 1,
            payAmount: parseFloat(userPayAmount.toFixed(2)),
            isFirstPay: isFirstPay,
            firstFanxianComplete: firstFanxianComplete,
        }
        if (isFirstPay) {
            userData.firstPayStoreName = store.data.storeName
            userData.firstPayAmount = parseFloat((iorder.data.payAmount).toFixed(2))
        }

        if (isSecondPay) {
            userData.secondPayStoreName = store.data.storeName
            userData.secondPayAmount = parseFloat((iorder.data.payAmount).toFixed(2))
        }

        if (isThirdPay) {
            userData.thirdPayStoreName = store.data.storeName
            userData.thirdPayAmount = parseFloat((iorder.data.payAmount).toFixed(2))
        }

        const userUpdate = await db.collection('users').doc(openid).update({
            data: {
                data: userData
            }
        })
        console.log('userUpdate: ',userUpdate)

        // // 邀请者收益
        // if (user.data.data.inviteBy && isFirstPay) {
        //     const upLineUser = await db.collection('users').where({inviteCode: user.data.data.inviteBy}).get()
        //     if (upLineUser.data.length > 0) {
        //         upLineU = upLineUser.data[0]
        //         await db.collection('users').doc(upLineU._id).update({
        //             data: {
        //                 data: {
        //                     balance: upLineU.data.balance + 1000
        //                 }
        //             },
        //             success: res => {
        //                 console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        //             },
        //             fail: err => {
        //                 console.error('[数据库] [新增记录] 失败：', err)
        //                 throw(e)
        //             }
        //         })
        //     }
        // }
        
        orders = store.data.orders
        let avgPrice = store.data.avgPrice
        if (orders == 0) {
            avgPrice = parseFloat(iorder.data.totalAmount).toFixed(2) * 1
        }else {
            avgPrice = ((avgPrice * orders+parseFloat(iorder.data.totalAmount))/(orders + 1)).toFixed(2) * 1
        }

        // 商户收入
        
        let updatedBalance = parseFloat((parseFloat(iorder.data.totalAmount) + parseFloat(subsidy)- parseFloat(iorder.data.income7)).toFixed(2))
        const storeUpdate = await db.collection('mstores').doc(storeID).update({
            data: {
                balance: _.inc(updatedBalance),
                orders: _.inc(1),
                avgPrice: avgPrice,
            }
        })
        console.log("storeUpdate:", storeUpdate)
        
        // 根据条件给用户发放优惠券
        // if (payby == 1) {
        //     cloud.callFunction({
        //         name:"zgivecoupon",
        //         data: {
        //           storeID: iorder.data.storeId,
        //           orderId: orderId,
        //           openid: openid,
        //           amount: iorder.data.finalAmount
        //         },
        //         success(res) {
        //             console.log(res)
        //         },
        //         fail: function(e) {
        //             console.log(e)
        //         }
        //     })
        // }

        // 通知商家下单信息
        notifyMerchant(store.data,orderId)

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


async function notifyMerchant(store,orderId) {
    if (!store.unionid) {
        // 不存在unionid
        return
    }

    const iorder = await db.collection('iorders').doc(orderId).get()
    let order = iorder.data
    const oauser = await db.collection('oausers').doc(store.unionid).get()

    var payway = "微信支付"
    if (order.payType == 2) {
        payway = "余额"
    }else  if (order.payType == 4) {
        payway = "微信+余额"
    }

    try {
      let params = {
        "touser": oauser.data.oaopenid,
        "template_id":"WCk1obq17BXnnr5FYU2YM-nfjt-oMxvgFreMDsmGBak",
        "miniprogram":{
          "appid":"wx9b588b2b3f090400",
          "pagepath":"pages/console/orderDetail/orderDetail?id="+orderId
        },          
        "data":{
                "first": {
                    "value":"收到新订单",
                    "color":"#173177"
                },
                "keyword1":{
                    "value":store.storeName,
                    "color":"#173177"
                },
                "keyword2": {
                    "value":order.payAmount + order.mustPayAmount - order.realCoupon,
                    "color":"#173177"
                },
                "keyword3": {
                    "value":order.userName,
                    "color":"#173177"
                },
                  "keyword4": {
                    "value":payway,
                    "color":"#173177"
                },
                "keyword5": {
                    "value":"无",
                    "color":"#173177"
                },
                "remark":{
                    "value":"请及时处理~~",
                    "color":"#173177"
                }
        }
    }
    const wxetokens = await db.collection('wxetokens').get()
    let accessToken = wxetokens.data[0].token
    var res = await axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+accessToken,params)
    console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }