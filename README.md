# 🏇 競馬投票サイト（KEIBA NET）

Vue 3 製の競馬情報表示・投票デモサイトです。レース一覧・出走馬情報・馬券購入・投票履歴・レース結果の確認ができます。

**デモ:** https://sadaakiemuravaltes.github.io/keiba-html/

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| 本日のレース一覧 | 8レース表示・ステータス（受付中/発走前/締切/確定）・人気順オッズプレビュー |
| レース詳細 | 出走馬テーブル（馬番・馬名・騎手・性齢・体重・人気・オッズ）|
| 馬券購入 | 単勝・複勝・馬連・馬単・ワイド・3連複・3連単の7種対応 |
| 金額入力 | 100/500/1000円ショートカット・+1000加算・全額投票ボタン |
| 所持金管理 | 初期10,000円・投票で減算・的中で払戻・sessionStorage永続化 |
| 投票履歴 | 収支サマリー（総投票額・総払戻額・収支）・的中/ハズレ表示 |
| チャージ | 投票履歴画面から10,000円追加チャージ可能 |
| レース結果 | 1〜3着表示・単勝オッズ・自分の投票結果確認 |
| ヘッダー残高 | 現在の所持金をヘッダーに常時表示 |

---

## 技術スタック

- **Vue 3** — Composition API (`<script setup>`)
- **Vue Router 4** — `createWebHashHistory`（GitHub Pages 対応）
- **Vite 5** — ビルドツール
- **JavaScript** — TypeScript なし

状態管理はライブラリ不使用（`reactive` ストア + sessionStorage 永続化）。

---

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動 (http://localhost:5173/keiba-html/)
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## デプロイ (GitHub Pages)

`dist/` の内容を `gh-pages` ブランチへプッシュしてデプロイします。

```bash
npm run build

DEPLOY_DIR=/tmp/keiba-deploy
rm -rf $DEPLOY_DIR
git clone --branch gh-pages https://github.com/SadaakiEmuraValtes/keiba-html.git $DEPLOY_DIR 2>/dev/null \
  || (git clone https://github.com/SadaakiEmuraValtes/keiba-html.git $DEPLOY_DIR && cd $DEPLOY_DIR && git checkout --orphan gh-pages)
cp -r dist/. $DEPLOY_DIR/
cd $DEPLOY_DIR && git add -A && git commit -m "Deploy" && git push origin gh-pages --force
```

`vite.config.js` の `base` は `/keiba-html/` に設定済みです。

---

## プロジェクト構成

```
src/
├── App.vue               # ルートコンポーネント（ヘッダー・フッター含む）
├── main.js               # エントリーポイント
├── style.css             # グローバルスタイル
├── router/
│   └── index.js          # ルーティング定義
├── store/
│   └── index.js          # グローバルストア（reactive + sessionStorage）
├── data/
│   └── races.js          # レースマスタデータ（8レース・出走馬・オッズ・結果）
└── views/
    ├── HomeView.vue          # 本日のレース一覧
    ├── RaceDetailView.vue    # レース詳細・馬券購入
    ├── MyBetsView.vue        # 投票履歴・収支確認
    └── ResultsView.vue       # レース結果一覧
```

---

## 馬券種別

| 種別 | 説明 | 選択頭数 |
|------|------|---------|
| 単勝 | 1着馬を当てる | 1頭 |
| 複勝 | 3着以内に入る馬を当てる | 1頭 |
| 馬連 | 1・2着馬を順不同で当てる | 2頭 |
| 馬単 | 1・2着馬を順序通りに当てる | 2頭 |
| ワイド | 3着以内の2頭を順不同で当てる | 2頭 |
| 3連複 | 1〜3着馬を順不同で当てる | 3頭 |
| 3連単 | 1〜3着馬を順序通りに当てる | 3頭 |

---

## ライセンス

個人学習・デモ用途。架空の競馬投票サービスです。
