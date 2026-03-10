# 競馬投票シミュレーター（KEIBA NET）

Vue 3 製の架空競馬投票デモサイトです。JRA競馬場・仮想時刻・馬券購入・払い戻しをブラウザ上でシミュレーションできます。

**デモ:** https://sadaakiemuravaltes.github.io/keiba-html/

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| 開催日程選択 | 5パターンの開催日程（2026/03/07〜03/21）を切り替え |
| 仮想時刻 | 10:00〜21:00（1時間単位）を手動で進め、レース状態を制御 |
| スケジュール表 | 競馬場×12Rのグリッド。投票受付中/締切/確定をセル色で表示 |
| 馬券購入 | 単勝・複勝・馬複・馬単・ワイド・三連複・三連単の7種 |
| 購入方式 | 通常・流し（各種）・ボックス・フォーメーション |
| 残高チャージ | 仮想銀行振込でデモ用残高を追加（実際の入金なし） |
| 自動払い戻し | 仮想時刻を進めるとレース確定・購入馬券が自動精算 |
| マイページ | 残高・収支サマリー・投票履歴（的中/ハズレ/結果待ち）|
| ログイン | テストアカウント5種（ ID/パスワードはログイン画面に掲載）|
| 免責・ヘルプ | 架空サービスである旨の免責表示と操作ガイド |

---

## 技術スタック

- **Vue 3** — Composition API (`<script setup>`)
- **Vue Router 4** — `createWebHashHistory`（GitHub Pages 対応）
- **Vite 5** — ビルドツール
- **JavaScript** — TypeScript なし、ライブラリ最小構成

状態管理はライブラリ不使用（`reactive` ストア + sessionStorage 永続化）。

---

## セットアップ

```bash
npm install

# 開発サーバー (http://localhost:5173/keiba-html/)
npm run dev

# プロダクションビルド
npm run build
```

---

## デプロイ (GitHub Pages)

```bash
npm run build

DEPLOY_DIR=/c/Users/<username>/AppData/Local/Temp/keiba-deploy
rm -rf $DEPLOY_DIR
git clone --branch gh-pages https://github.com/SadaakiEmuraValtes/keiba-html.git $DEPLOY_DIR
cp -r dist/. $DEPLOY_DIR/
cd $DEPLOY_DIR && git add -A && git commit -m "Deploy" && git push origin gh-pages
```

`vite.config.js` の `base` は `/keiba-html/` に設定済みです。

---

## プロジェクト構成

```
src/
├── App.vue                   # ルートコンポーネント（ナビ・残高表示）
├── main.js
├── style.css                 # グローバルスタイル（ダークテーマ）
├── router/
│   └── index.js              # ルーティング (/, /race/:key, /my-page, /login, /help)
├── store/
│   └── index.js              # グローバルストア・自動精算ロジック
├── data/
│   ├── scenarios.js          # JRA競馬場定義・5日程シナリオ・raceKeyエンコード
│   ├── masterData.js         # 馬/結果の決定論的生成・払戻計算
│   └── users.js              # テストアカウント5件
└── views/
    ├── HomeView.vue          # スケジュール表・日程/時刻セレクタ
    ├── RaceDetailView.vue    # 馬券購入UI・競馬場/ラウンドスイッチャー
    ├── MyPageView.vue        # 残高チャージ・投票履歴
    ├── LoginView.vue         # ログインフォーム
    └── HelpView.vue          # 免責事項・操作ガイド
```

---

## raceKey 仕様

レースはすべて整数の `raceKey` で一意識別されます。

```
raceKey = dateIdx * 100000 + venueSeqIdx * 1000 + round
```

- `dateIdx`: 日程インデックス（0〜4）
- `venueSeqIdx`: その日の競馬場順序（0〜2）
- `round`: ラウンド（1〜12）

馬・結果は `raceKey` を seed とした LCG で決定論的に生成されるため、同じレースは常に同じ馬・同じ結果になります。

---

## 馬券種別

| 種別 | 説明 | 対応方式 |
|------|------|---------|
| 単勝 | 1着馬を当てる | 通常 |
| 複勝 | 3着以内に入る馬を当てる | 通常 |
| 馬複 | 1・2着馬を順不同で当てる | 通常/流し/ボックス/フォーメーション |
| 馬単 | 1・2着馬を順序通りに当てる | 通常/流し/ボックス/フォーメーション |
| ワイド | 3着以内の2頭を順不同で当てる | 通常/流し/ボックス/フォーメーション |
| 三連複 | 1〜3着馬を順不同で当てる | 通常/流し/ボックス/フォーメーション |
| 三連単 | 1〜3着馬を順序通りに当てる | 通常/流し/ボックス/フォーメーション |

---

## テストアカウント

| ログインID | パスワード |
|-----------|-----------|
| yamada | test1234 |
| sato | test1234 |
| suzuki | test1234 |
| tanaka | test1234 |
| ito | test1234 |

---

## 免責

架空の競馬投票デモサービスです。実際の入金・払い戻しは一切発生しません。
登場する競走馬・騎手名はすべてフィクションです。
