'use strict';
const pug = require('pug');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
const util = require('./handler-util');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
require('dayjs/locale/ja');
dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

const gachaList = [
  { result: '大吉', fortune: '最高の1日になりそう！' },
  { result: '中吉', fortune: '素晴らしい日。夢に向かって一歩進めるかも。' },
  { result: '吉', fortune: 'コツコツ頑張ると良いことがある日。' },
  { result: '小吉', fortune: '新しい出会いや発見がある予感。' },
  { result: '末吉', fortune: '落ち着いて行動すれば大丈夫。' },
];

// Cookieを取得する便利関数 Geminiくんありがとう
function getCookie(req, name) {
  const cookieString = req.headers.cookie;
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// GET / の処理（アクセス時の入り口）
function handleIndex(req, res) {
  if (req.method !== 'GET') return util.handleBadRequest(req, res);

  const todayStr = dayjs().tz().format('YYYY-MM-DD');
  const lastPeeledDate = getCookie(req, 'last_peeled_date');

  if (lastPeeledDate === todayStr) {
    // 今日すでにめくっている場合はメインページへリダイレクト
    res.writeHead(303, { 'Location': '/main' });
    res.end();
  } else {
    // まだめくっていない場合はカレンダー画面を表示
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(pug.renderFile('./views/calendar.pug', { user: req.user }));
  }
}

// /gacha の処理（めくるボタンが押された時）
async function handleGacha(req, res) {
  if (req.method !== 'POST') return util.handleBadRequest(req, res);

  const randomIndex = Math.floor(Math.random() * gachaList.length);
  const drawnResult = gachaList[randomIndex];
  const now = dayjs().tz();
  const todayStr = now.format('YYYY-MM-DD');

  try {
    // DBに保存
    await prisma.gachaLog.create({
      data: {
        username: req.user,
        result: drawnResult.result,
        drawnAt: new Date()
      }
    });
  } catch (error) {
    console.error('Prismaエラー', error);
  }

  // Cookieに今日の日付と結果を保存（1日有効）
  const maxAge = 60 * 60 * 24; // 24時間
  res.setHeader('Set-Cookie', [
    `last_peeled_date=${todayStr}; Max-Age=${maxAge}; Path=/`,
    `today_fortune=${encodeURIComponent(drawnResult.result)}; Max-Age=${maxAge}; Path=/`
  ]);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  // 結果画面には「メインページへ進む」ボタンを配置する想定
  res.end(pug.renderFile('./views/result.pug', { result: drawnResult , user: req.user}));
}

// handleMain 関数を丸ごと修正（async関数に変更し、DBから履歴を取得）
async function handleMain(req, res) {
  if (req.method !== 'GET') return util.handleBadRequest(req, res);

  const todayStr = dayjs().tz().format('YYYY年MM月DD日');
  const todayFortune = getCookie(req, 'today_fortune') || '未実施';

  // 追加：ログインユーザーの履歴を新しい順に最大5件取得
  let history = [];
  try {
    history = await prisma.gachaLog.findMany({
      where: { username: req.user },
      orderBy: { drawnAt: 'desc' },
      take: 5
    });
  } catch (error) {
    console.error('履歴取得エラー', error);
  }

  // 取得した履歴の日付を見やすくフォーマット
  const formattedHistory = history.map(log => ({
    result: log.result,
    date: dayjs(log.drawnAt).tz().format('MM/DD HH:mm')
  }));

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(pug.renderFile('./views/main.pug', { 
    today: todayStr,
    fortune: todayFortune,
    history: formattedHistory, // 履歴データをPugに渡す
    user: req.user,
  }));
}

// GET /calendar の処理（将来用）
function handleCalendar(req, res) {
  if (req.method !== 'GET') return util.handleBadRequest(req, res);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>Googleカレンダー同期画面（準備中）</h1><a href="/main">メインページへ戻る</a>');
}

module.exports = {
  handleIndex,
  handleGacha,
  handleMain,
  handleCalendar
};