const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const {
  translateText
} = require('./google-translate'); // 引入翻译功能

async function crawlCompaniesHouse(url) {
  try {
    // 发起 GET 请求
    const response = await axios.get(url);

    // 加载页面内容
    const $ = cheerio.load(response.data);

    // 示例: 提取页面标题
    const title = $('title').text();
    console.log(`页面标题: ${title}`);

    // 获取 id 为 "sic-codes" 的表格
    const table = $('#sic-codes');

    // 检查表格是否存在
    if (table.length === 0) {
      console.log('未找到 id 为 "sic-codes" 的表格');
      return;
    }

    // 提取表格中的数据
    const rows = table.find('tr'); // 查找所有行
    const data = []; // 存储表格数据

    // 添加标题行
    data.push(['Code', 'ParentCode', 'Description', 'Description(zh-CN)']);

    // 遍历表格行
    let parentCode = '';

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const cols = $(row).find('td'); // 查找当前行中的所有单元格
      const rowData = [];
      cols.each((i, col) => {
        rowData.push($(col).text().trim()); // 获取单元格文本并去除空白
      });

      if (rowData.length > 0) { // 确保行中有数据
        if (rowData[0]?.startsWith('Section')) {
          parentCode = rowData[0]; // 更新父级代码
        }

        data.push([rowData[0], parentCode, rowData[1], '']); // 先将原始数据添加到 data 中
      }
    }

    console.log('提取到数据size=' + data.length);

    // 定义分批大小
    const batchSize = 3; // 每批翻译 5 个描述

    // 批量翻译描述
    for (let i = 1; i < data.length; i += batchSize) { // 从第一行开始，跳过标题行
      console.log(`正在翻译第 ${i} 到 ${i + batchSize - 1} 个描述...`);
      const batch = data.slice(i, i + batchSize); // 获取当前批次的描述

      // 使用 Promise.all 并行翻译当前批次的描述
      const translations = await Promise.all(
        batch.map(async (item) => {
          const translatedDescription = await translateText(item[2]); // item[2] 是 Description
          return translatedDescription;
        })
      );

      // 将翻译结果添加到原始数据中
      for (let j = 0; j < translations.length; j++) {
        data[i + j][3] = translations[j]; // 将翻译结果填入对应的行
      }
    }

    // 检查是否提取到了数据
    if (data.length <= 1) { // 仅检查是否有数据（标题行）
      console.log('未能提取到任何数据');
      return;
    }

    // 导出数据到 Excel
    const worksheet = XLSX.utils.aoa_to_sheet(data); // 将数据转换为工作表
    const workbook = XLSX.utils.book_new(); // 创建新工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIC Codes'); // 将工作表添加到工作簿

    // 写入 Excel 文件
    const fileName = `exportFile/crawlCompaniesHouse-${new Date().toISOString().replace(/[:.-]/g, '')}.xlsx`; // 修改文件名以区分
    XLSX.writeFile(workbook, fileName);
    console.log(`数据已成功导出到 ${fileName}`);

  } catch (error) {
    console.error(`爬虫出错: ${error.message}`);
  }
}

// 调用爬虫函数
const urlToCrawl = 'https://resources.companieshouse.gov.uk/sic/'; // 替换为需要爬取的 URL
crawlCompaniesHouse(urlToCrawl);