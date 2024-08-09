const puppeteer = require('puppeteer');

const translateText = async (text) => {
  if (!text) {
    return '';
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // 指定 Chrome 浏览器路径
    headless: true // 是否以无头模式运行
  });
  const page = await browser.newPage();

  const url = `https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(text)}&op=translate`;
  await page.goto(url);

  const maxRetries = 3; // 最大重试次数
  let attempts = 0;
  let translatedText = null;

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // 等待函数

  while (attempts < maxRetries) {
    try {
      // 等待翻译结果出现
      await page.waitForSelector('span[jsname="W297wb"]', {
        timeout: 60000
      });

      // 增加额外的等待时间，以确保翻译完成
      await wait(1000); // 等待1秒

      translatedText = await page.$eval('span[jsname="W297wb"]', el => el.innerText);

      if (translatedText && translatedText.trim() !== "") {
        break; // 如果成功获取到翻译结果，跳出循环
      }
    } catch (error) {
      attempts++;
      console.error(`第 ${attempts} 次尝试失败: ${error.message}`);
      await wait(1000); // 等待1秒再重试
    }
  }

  await browser.close();

  if (translatedText) {
    return translatedText; // 返回翻译后的文本
  } else {
    console.error(`翻译失败，返回原文: ${text}`);
    return ''; // 如果所有尝试都失败，返回原文
  }
};

module.exports = {
  translateText
};