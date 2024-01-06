// 存储已生成的随机数的数组
var generatedNumbers = [];

// 生成五位随机数函数
function generateUniqueRandomNumber() {
  var randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * 100000);
  } while (generatedNumbers.includes(randomNumber)); // 检查随机数是否已存在于数组中

  generatedNumbers.push(randomNumber); // 将随机数添加到数组中
  if (generatedNumbers.length > 99999) {
    generatedNumbers = []; // 重置数组，以便继续循环使用随机数
  }

  return randomNumber.toString().padStart(5, '0'); // 返回五位随机数，并补全前导零
}

// 导出生成唯一随机数的函数
module.exports = {
  generateUniqueRandomNumber: generateUniqueRandomNumber
};