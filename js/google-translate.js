const puppeteer = require('puppeteer');

const translateText = async (text) => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // 指定 Chrome 浏览器路径
    headless: true // 是否以无头模式运行
  });
  const page = await browser.newPage();

  const url = `https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(text)}&op=translate`;
  await page.goto(url);

  try {
    // 等待翻译结果出现
    await page.waitForSelector('span[jsname="W297wb"]', {
      timeout: 60000
    }); // 增加超时时间

    const translatedText = await page.$eval('span[jsname="W297wb"]', el => el.innerText);
    await browser.close();
    return translatedText; // 返回翻译后的文本
  } catch (error) {
    console.error(`翻译出错: ${error.message}`);
    await browser.close();
    return text; // 如果翻译失败，返回原文
  }
};

module.exports = {
  translateText
};