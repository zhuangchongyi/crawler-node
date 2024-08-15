const xlsx = require('xlsx');
const {
  translateText
} = require('./translate/google-puppeteer'); // 引入翻译功能


async function transformSingaporeSIC(path) {

  // 读取 Excel 文件
  const workbook = xlsx.readFile(path);

  // 获取第一个工作表的名称
  const firstSheetName = workbook.SheetNames[0];

  // 获取第一个工作表
  const worksheet = workbook.Sheets[firstSheetName];

  // 将工作表数据转换为 JSON 格式
  const data = xlsx.utils.sheet_to_json(worksheet);

  // 输出数据
  // console.log(JSON.stringify(data));


  // 检查是否提取到了数据
  if (data.length <= 1) { // 仅检查是否有数据（标题行）
    console.log('未能提取到任何数据');
    return;
  }

  let pValue = null
  data.forEach((row) => {
    row.value = row.value.trim()
    row.valueE = row.valueE.trim()
    if (row.value.length == 1) {
      row.pValue = 0
      pValue = row.value
    } else if (row.value.length == 2) {
      row.pValue = pValue
    } else if (row.value.length == 3) {
      row.pValue = row.value.substr(0, 2)
    } else if (row.value.length == 4) {
      row.pValue = row.value.substr(0, 3)
    } else if (row.value.length == 5) {
      row.pValue = row.value.substr(0, 4)
    }
  })

  // 定义分批大小
  const batchSize = 3; // 每批翻译 5 个描述

  // 批量翻译描述
  for (let i = 1; i < data.length; i += batchSize) { // 从第一行开始，跳过标题行
    console.log(`正在翻译第 ${i} 到 ${i + batchSize - 1} 个描述...`);
    const batch = data.slice(i, i + batchSize); // 获取当前批次的描述

    // 使用 Promise.all 并行翻译当前批次的描述
    const translations = await Promise.all(
      batch.map(async (item) => {
        const translatedDescription = await translateText(item.valueE); // item.valueE 是 Description
        return translatedDescription;
      })
    );

    // 将翻译结果添加到原始数据中
    for (let j = 0; j < translations.length; j++) {
      data[i + j].title = translations[j]; // 将翻译结果填入对应的行
    }
  }


  // 导出数据到 Excel
  worksheet = XLSX.utils.aoa_to_sheet(data); // 将数据转换为工作表
  workbook = XLSX.utils.book_new(); // 创建新工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Singapore SIC Codes'); // 将工作表添加到工作簿

  // 写入 Excel 文件
  const fileName = `exportFile/ssic2020-classification-structure-${new Date().toISOString().replace(/[:.-]/g, '')}.xlsx`; // 修改文件名以区分
  XLSX.writeFile(workbook, fileName);
  console.log(`数据已成功导出到 ${fileName}`);

}

const filePath = 'C:\\Users\\Admin\\Desktop\\ssic2020-classification-structure.xlsx';
transformSingaporeSIC(filePath);