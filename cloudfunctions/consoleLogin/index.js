// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 云函数入口函数
/**
 * 1. 根据手机号获取信息，如果没获取到，则注册，并绑定手机号和当前openid
 * 2. 根据手机号获取信息，如果获取到，比对获取到到信息中到openid 和 当前到openid
 *    2.1 如果openid 和 当前openid 相同，则可以修改
 *    2.2 如果openid 和 当前openid 不同，则只可读取
 * 3. 以上两条规则用户所有到云函数，并且所有到内容都以手机号作为标示。
 */

 /**
  * precheck: 提前检查是否支持密码登录，只有用户存在且设置了密码以后，才可以密码登录。
  *   response:
  *     -1 只能验证码方式登录
  *      1 可通过密码方式登录
  * login: 登录
  *   bypass 密码方式登录
  *   response: 
  *     -1 账户不存在，提示用验证码登录
  *     -2 未设置密码，提示用验证码登录
  *     -3 密码错误
  *     -4 验证码错误
  *     -5 验证码过期
  *     -10 请求类型不支持
  */
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log('event is: ', event)

    let type = event.type
    if (type == 'precheck') {
      const mstore = await db.collection('mstores').where({openid: wxContext.OPENID}).get()
      if (mstore.data.length > 0 && mstore.data[0].password) {
        return 1
      }
      return -1
    } else if (type == 'login') {
      let phone = event.phone
      let password = event.password
      let bypass = event.bypass
      if (bypass) {
        const mstore = await db.collection('mstores').where({merchantPhone: phone}).get()
        if (mstore.data.length == 0) {
          return -1 // first login
        }
        let mStore = mstore.data[0]
        if (!mStore.password) {
          return -2 // password not set
        }
        let oldPassword = mStore.password
        if (sha1(password) != oldPassword) {
          return -3 // wrong password
        }
        return mstore.data[0]
      } else {
        let code = event.code
        let codeID = event.codeID

        // first login by code
        // const result = await db.collection("codes").doc(codeID).get()
        // if (result.data.code!=code) {
        //   return -4 // invalid code
        // }
        // console.log(Date.parse(new Date())/10-result.data.time/10)
        // console.log(Date.parse(new Date()))
        // console.log(result.data.time)
        // if (Date.parse(new Date())/1000-result.data.time/1000 > 10 * 60) {
        //   return -5 // code expired
        // }
        // // 验证通过，删除code
        // await db.collection("codes").doc(event.codeID).remove()

        mstore = await db.collection('mstores').where({merchantPhone: phone}).get()
        if (mstore.data.length == 0) {
          // 第一次登录 注册基本信息
          const res = await db.collection('mstores').add({
            data: {
              merchantPhone: phone,
              password: '',
              openid: wxContext.OPENID,
              avgPrice: 0,
              balance: 0,
              banners: [],
              discount: 9,
              discountStart: Date.parse(new Date()),
              discountEnd: Date.parse(new Date()),
              createdAt: Date.parse(new Date()),
              updatedAt: Date.parse(new Date()),
              startTime: '00:00',
              endTime: '24:00',
              deleted: 0,
              orders: 0,
              banners: [],
              productImages: [],
              storeImages: [],
              promoteImages: [],
              complete: false, // 未完善资料
              approved: false, // 未签约
            },
            success: res => {
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              console.error('[数据库] [新增记录] 失败：', err)
              throw(err)
            }
          })
          return res
        }else {
          await db.collection('mstores').doc(mstore.data[0]._id).update({
            data: {
              openid: wxContext.OPENID,
            }
          })
          return mstore.data[0]
        }
      }
    }else {
      return -10 // unsupported type
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