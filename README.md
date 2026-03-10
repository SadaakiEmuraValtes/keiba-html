# 競馬投票シミュレーター（KEIBA NET）

Vue 3 製の架空競馬投票デモサイトです。JRA競馬場・仮想時刻・馬券購入・払い戻しをブラウザ上でシミュレーションできます。

**デモ:** https://sadaakiemuravaltes.github.io/keiba-html/

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| 開催日程選択 | 5パターンの開催日程（2026/03/07〜03/21）を切り替え。日程ごとに異なる競馬場組み合わせ |
| 重賞一覧 | スケジュール表の下部に重賞レース（GI/GII/GIII）を締め切り時刻順で表示。各競馬場最大2レース |
| 仮想時刻 | 9:00〜21:00（1時間単位）を手動操作。9:00時点で1Rが投票受付中 |
| スケジュール表 | 競馬場×12Rのグリッド。全セル均一サイズ・クリック可能（出馬表・投票・結果） |
| 出馬表タブ | 出走馬の詳細（枠・番・馬名・騎手・性齢・体重・人気・オッズ） |
| オッズタブ | 7式別（単勝/複勝/馬複/馬単/ワイド/三連複/三連単）の組み合わせオッズ一覧。単勝/複勝<10=赤、馬複以上<100=赤 |
| 投票タブ | 7種別 × 4方式（通常/流し/ボックス/フォーメーション）の馬券購入 |
| 結果タブ | 全着順テーブル + 全式別払戻金（100円あたり）一覧 |
| **WIN5** | 日程内の指定5レース全1着馬を当てる特別式。複数頭選択可（ボックス購入）。全レース確定後に自動精算 |
| 残高チャージ | 仮想銀行振込でデモ用残高を追加（実際の入金なし） |
| 自動払い戻し | 仮想時刻を進めるとレース確定・購入馬券が自動精算 |
| マイページ | 残高・収支サマリー・投票履歴（的中/ハズレ/結果待ち） |
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
cd keiba-html && npm run build

DEPLOY_DIR=/c/Users/sadaaki.emura/AppData/Local/Temp/keiba-deploy
rm -rf $DEPLOY_DIR
git clone --branch gh-pages https://github.com/SadaakiEmuraValtes/keiba-html.git $DEPLOY_DIR
cp -r dist/. $DEPLOY_DIR/
cd $DEPLOY_DIR && git add -A && git commit -m "Deploy: ..." && git push origin gh-pages
```

`vite.config.js` の `base` は `/keiba-html/` に設定済みです。

---

## プロジェクト構成

```
src/
├── App.vue                   # ルートコンポーネント（ナビ・残高表示）
├── main.js
├── style.css                 # グローバルスタイル（白背景・グリーン+ゴールドアクセント）
├── router/
│   └── index.js              # ルーティング (/, /race/:key, /win5, /my-page, /login, /help)
├── store/
│   └── index.js              # グローバルストア・自動精算ロジック（WIN5対応）
├── data/
│   ├── scenarios.js          # JRA競馬場定義・5日程シナリオ・raceKeyエンコード・WIN5レース定義
│   ├── masterData.js         # 馬/結果の決定論的生成・全着順・払戻計算
│   └── users.js              # テストアカウント5件
└── views/
    ├── HomeView.vue          # スケジュール表・重賞一覧（締め切り順）・日程/時刻セレクタ
    ├── RaceDetailView.vue    # 出馬表/オッズ/投票/結果タブ + 競馬場・ラウンドスイッチャー
    ├── Win5View.vue          # WIN5専用ページ（5レース馬選択・購入）
    ├── MyPageView.vue        # 残高チャージ・投票履歴
    ├── LoginView.vue         # ログインフォーム
    └── HelpView.vue          # 免責事項・操作ガイド
```

---

## 開催日程・競馬場組み合わせ

| 日程 | 競馬場 |
|------|--------|
| 2026/03/07（土） | 東京・阪神・小倉 |
| 2026/03/08（日） | 東京・阪神・小倉 |
| 2026/03/14（土） | 中山・京都・中京 |
| 2026/03/15（日） | 中山・京都・新潟 |
| 2026/03/21（土） | 東京・阪神・福島 |

---

## raceKey 仕様

```
raceKey = dateIdx * 100000 + venueSeqIdx * 1000 + round
```

馬・結果は `raceKey` を seed とした LCG で決定論的生成。全着順は generateFullResult() で取得。
結果パターンは LCG ハッシュで選択（35種、人気分散済み）。

---

## WIN5 仕様

- 各日程に5レースが指定（`getWin5RaceKeys(dateIdx)` で取得）
- 各レースで1頭以上を選択、組み合わせ = 選択頭数の積
- 全5レースが「投票受付中」の間のみ購入可能
- 全レース確定後に自動精算
- 払戻 = 全5勝馬のオッズ積 × 30（最低 ¥100,000/100円）

---

## オッズ色分け

| 式別 | 赤（低オッズ） | 黒（高オッズ） |
|------|----------------|----------------|
| 単勝・複勝 | 10倍未満 | 10倍以上 |
| 馬複・馬単・ワイド・三連複・三連単 | 100倍未満 | 100倍以上 |

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
