const args = process.argv.slice(2);
console.log('args', args);

const fileToRun = args[0] || 'js/debug.js'; // 默认文件

require(`./${fileToRun}`);