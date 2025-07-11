#!/usr/bin/env node

// 使用方法：node update-urls.js https://your-actual-vercel-app.vercel.app

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.log('使用方法：node update-urls.js https://your-actual-vercel-app.vercel.app');
  process.exit(1);
}

const newUrl = process.argv[2];
const placeholder = 'https://your-vercel-app.vercel.app';

// 需要更新的檔案列表
const filesToUpdate = [
  'app/routes/_index.tsx',
  'app/routes/memory.tsx',
  'app/routes/library.tsx',
  'app/routes/stats.tsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes(placeholder)) {
      content = content.replace(new RegExp(placeholder, 'g'), newUrl);
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 已更新 ${filePath}`);
    } else {
      console.log(`⚠️  ${filePath} 中未找到需要更新的 URL`);
    }
  } else {
    console.log(`❌ 檔案不存在：${filePath}`);
  }
});

console.log(`\n🎉 URL 更新完成！新的 URL：${newUrl}`);
console.log('建議重新建置專案：npm run build');