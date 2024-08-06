// google-translate.js
const puppeteer = require('puppeteer');

const translateText = async (text) => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // 指定 Chrome 浏览器路径
    headless: true // 是否以无头模式运行
  });
  const page = await browser.newPage();

  const url = `https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(text)}&op=translate`;
  await page.goto(url);

  // 等待翻译结果出现
  await page.waitForSelector('span[jsname="W297wb"]'); // 选择器可能需要根据实际情况调整

  const translatedText = await page.$eval('span[jsname="W297wb"]', el => el.innerText);

  await browser.close();

  console.log('translatedText', translatedText);
  return translatedText; // 返回翻译后的文本
};

module.exports = {
  translateText
};