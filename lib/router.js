'use strict';
const calendarHandler = require('./calendar-handler');
const util = require('./handler-util');

function route(req, res) {
  switch (req.url) {
    case '/': 
      // 初回かどうか判定
      calendarHandler.handleIndex(req, res);
      break;
    case '/gacha':
      // 一日の初回なら 日めくりとガチャ
      calendarHandler.handleGacha(req, res);
      break;
    case '/main':
      // メイン画面 →teigiに詳細
      calendarHandler.handleMain(req, res);
      break;
    case '/calendar':
      // 今後追加予定のGoogleカレンダー用
      calendarHandler.handleCalendar(req, res);
      break;
    case '/logout':
      // 仮のBasic認証用
      util.handleLogout(req, res);
      break;
    case '/style.css':
      // デザインとカラーテーマのファイル
      util.handleStyleCssFile(req, res);
      break;
    case '/calendar.js':
      // めくるモーションなどを制御するファイル
      util.handleCalendarJsFile(req, res);
      break;
    case '/favicon.ico':
      // アイコン画像
      util.handleFavicon(req, res);
      break;
    default:
      // 404エラー
      util.handleNotFound(req, res);
      break;
  }
}

module.exports = {
  route
};