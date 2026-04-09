// ================================================
// BSN 빌딩관리 - 웹서버 + 텔레그램 봇 동시 실행
// ================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

// 웹 서버
const PORT = 5500;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // API: 텔레그램 봇이 저장한 일정 가져오기
  if (req.url === '/api/schedules') {
    const schFile = path.join(__dirname, 'schedules.json');
    try {
      const data = fs.readFileSync(schFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      res.end(data);
    } catch(e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('==========================================');
  console.log('  🏢 BSN 빌딩관리 시스템');
  console.log('==========================================');
  console.log('');
  console.log('  🌐 웹 현황판: http://localhost:' + PORT);
  console.log('');

  // 텔레그램 봇 환경변수 직접 설정 후 실행
  try {
    var envPath = path.join(__dirname, 'telegram-bot', '.env');
    var envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(function(line) {
      var parts = line.trim().split('=');
      if (parts.length >= 2 && parts[0]) {
        process.env[parts[0]] = parts.slice(1).join('=');
      }
    });
    require('./telegram-bot/bot.js');
  } catch (e) {
    console.log('  ⚠️ 텔레그램 봇 실행 실패:', e.message);
    console.log('  (웹 현황판은 정상 작동합니다)');
    console.log('');
  }
});
