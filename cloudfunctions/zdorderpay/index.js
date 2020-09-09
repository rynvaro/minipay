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

    let password = event.password

    var result = {}

    try {
        const merchant = await db.collection('merchants').doc(merchantID).get()
        const store = await db.collection('stores').doc(storeID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        if (payby == 2 && sha1(password) != user.data.payPassword) {
            return -2 // 支付密码错误
        }


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
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        await db.collection('stores').doc(storeID).update({
            data: {
                sales: store.data.sales + 1,
                data: {
                    data:{
                        sales: store.data.data.data.sales + 1,
                    }
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
  };
  
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
  };