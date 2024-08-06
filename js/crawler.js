const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');


async function crawlCompaniesHouse(url) {
  try {
    // 发起 GET 请求
    const response = await axios.get(url);

    // 加载页面内容
    const $ = cheerio.load(response.data);

    // 示例: 提取页面标题
    const title = $('title').text();
    console.log(`页面标题: ${title}`);

    // 其他数据提取逻辑
    // ...

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

    rows.each((index, row) => {
      const cols = $(row).find('td'); // 查找当前行中的所有单元格
      const rowData = [];
      cols.each((i, col) => {
        rowData.push($(col).text().trim()); // 获取单元格文本并去除空白
      });
      if (rowData.length > 0) { // 确保行中有数据
        data.push(rowData); // 将行数据添加到数组中
      }
    });

    // 导出数据到 Excel
    const worksheet = XLSX.utils.aoa_to_sheet(data); // 将数据转换为工作表
    const workbook = XLSX.utils.book_new(); // 创建新工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIC Codes'); // 将工作表添加到工作簿

    // 写入 Excel 文件
    const fileName = 'exportFile/sic_codes.xlsx';
    XLSX.writeFile(workbook, fileName);
    console.log(`数据已成功导出到 ${fileName}`);


  } catch (error) {
    console.error(`爬虫出错: ${error}`);
  }

}

// 调用爬虫函数
const urlToCrawl = 'https://resources.companieshouse.gov.uk/sic/'; // 替换为需要爬取的 URL
crawlCompaniesHouse(urlToCrawl);