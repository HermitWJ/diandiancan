/**
 * SHA-256 哈希工具
 * 纯JavaScript实现，适用于微信小程序环境
 */

function sha256(message) {
  // 初始哈希值（前8个质数的平方根的小数部分的前32位）
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // 64个常量（前64个质数的立方根的小数部分的前32位）
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // 右旋转
  function ROTR(n, x) {
    return (x >>> n) | (x << (32 - n));
  }

  // SHA-256 逻辑函数
  function Ch(x, y, z) { return (x & y) ^ (~x & z); }
  function Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
  function Sigma0(x) { return ROTR(2, x) ^ ROTR(13, x) ^ ROTR(22, x); }
  function Sigma1(x) { return ROTR(6, x) ^ ROTR(11, x) ^ ROTR(25, x); }
  function sigma0(x) { return ROTR(7, x) ^ ROTR(18, x) ^ (x >>> 3); }
  function sigma1(x) { return ROTR(17, x) ^ ROTR(19, x) ^ (x >>> 10); }

  // 将字符串转为UTF-8字节数组
  function stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i);
      if (charCode < 0x80) {
        bytes.push(charCode);
      } else if (charCode < 0x800) {
        bytes.push(0xc0 | (charCode >> 6));
        bytes.push(0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        bytes.push(0xe0 | (charCode >> 12));
        bytes.push(0x80 | ((charCode >> 6) & 0x3f));
        bytes.push(0x80 | (charCode & 0x3f));
      } else {
        // 代理对
        i++;
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (charCode >> 18));
        bytes.push(0x80 | ((charCode >> 12) & 0x3f));
        bytes.push(0x80 | ((charCode >> 6) & 0x3f));
        bytes.push(0x80 | (charCode & 0x3f));
      }
    }
    return bytes;
  }

  // 消息预处理（填充）
  const msgBytes = stringToBytes(message);
  const bitLength = msgBytes.length * 8;

  // 添加 1 位
  msgBytes.push(0x80);

  // 填充至 (length % 64 === 56)
  while (msgBytes.length % 64 !== 56) {
    msgBytes.push(0x00);
  }

  // 添加原始消息长度（64位大端）
  // 高32位（对于一般长度消息为0）
  msgBytes.push(0, 0, 0, 0);
  // 低32位
  msgBytes.push((bitLength >>> 24) & 0xff);
  msgBytes.push((bitLength >>> 16) & 0xff);
  msgBytes.push((bitLength >>> 8) & 0xff);
  msgBytes.push(bitLength & 0xff);

  // 处理每个512位（64字节）的块
  const h = H.slice();
  for (let i = 0; i < msgBytes.length; i += 64) {
    // 准备消息调度表
    const W = new Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] = (msgBytes[i + t * 4] << 24) |
              (msgBytes[i + t * 4 + 1] << 16) |
              (msgBytes[i + t * 4 + 2] << 8) |
              (msgBytes[i + t * 4 + 3]);
    }
    for (let t = 16; t < 64; t++) {
      W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) | 0;
    }

    // 初始化工作变量
    let a = h[0], b = h[1], c = h[2], d = h[3];
    let e = h[4], f = h[5], g = h[6], hh = h[7];

    // 64轮压缩
    for (let t = 0; t < 64; t++) {
      const T1 = (hh + Sigma1(e) + Ch(e, f, g) + K[t] + W[t]) | 0;
      const T2 = (Sigma0(a) + Maj(a, b, c)) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + T1) | 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) | 0;
    }

    // 更新哈希值
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  }

  // 输出为十六进制字符串
  let hash = '';
  for (let i = 0; i < 8; i++) {
    hash += ('00000000' + (h[i] >>> 0).toString(16)).slice(-8);
  }

  return hash;
}

module.exports = {
  sha256
};
