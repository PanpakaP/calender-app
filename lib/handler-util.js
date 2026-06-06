'use strict';
const pug = require('pug');
const fs = require('node:fs');

// 30日間のキャッシュ設定（秒数で指定）
// 30日 × 24時間 × 60分 × 60秒 = 2592000秒
const cacheControlValue = 'public, max-age=2592000';

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  // viewsフォルダ内の 404.pug を表示
  res.end(pug.renderFile('./views/404.pug'));
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  
  // ファイルがない場合にサーバーが落ちるのを防ぐ
  try {
    const favicon = fs.readFileSync('./favicon.ico');
    res.end(favicon);
  } catch (e) {
    res.end(); // エラーを無視して空のレスポンスを返す
  }
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
    'Cache-Control': cacheControlValue // 30日キャッシュを付与
  });
  const file = fs.readFileSync('./public/style.css');
  res.end(file);
}

//カレンダー用のJSファイルを返す
function handleCalendarJsFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript',
    'Cache-Control': cacheControlValue // 30日キャッシュを付与
  });
  const file = fs.readFileSync('./public/calendar.js');
  res.end(file);
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストです');
}

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/logout.pug'));
}

// 外部から呼び出せるようにエクスポート
module.exports = {
  handleNotFound,
  handleFavicon,
  handleStyleCssFile,
  handleCalendarJsFile,
  handleBadRequest,
  handleLogout,
};