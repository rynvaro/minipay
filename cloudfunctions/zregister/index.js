// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var result = {}

  // TODO 冲突
  let inviteCode = Math.random().toString().substr(2,8)
  let payPassword = sha1('123456')// TODO
    try {
        result = await db.collection('users').add({
          data: {
              _id: wxContext.OPENID,
              data: event,
              createdAt: Date.parse(new Date()),
              updatedAt: Date.parse(new Date()),
              inviteCode: inviteCode,
              payPassword: payPassword,
          },
          success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw(err)
          }
      })

    //   const rules = await db.collection('couponrules').where({type: 'register'}).get()
    //   if (rules.data.length > 0) {
    //     const tmpCoupn = await db.collection('coupondic').where({code: rules.data[0].code}).get()
    //     if (tmpCoupn.data.length > 0) {
    //       await db.collection('icoupons').add({
    //           data: {
    //               _id: wxContext.OPENID,
    //               isnew: true,
    //               openid: wxContext.OPENID,
    //               status: 0,
    //               timestamp: Date.parse(new Date()),
    //               expireAt: new Date().getTime() + 24 * 3600 * tmpCoupn.data[0].vpday * 1000,
    //               coupon: {
    //                   point: tmpCoupn.data[0].point,
    //                   type: 3,
    //                   value: tmpCoupn.data[0].value,
    //                   man: tmpCoupn.data[0].man,
    //               }
    //           }
    //       })
    //     }
    //   }
    // result.redpackvalue = 5

    } catch(e) {
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