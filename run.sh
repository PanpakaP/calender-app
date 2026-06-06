#!/bin/bash

# Prismaのクライアントを生成（DBと通信するための準備）
npx prisma generate

# データベースの構造を同期（テーブルの作成など）
npx prisma db push

# Node.jsサーバーを起動
node index.js